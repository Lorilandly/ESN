import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import { readFileSync } from 'fs';
import UserModel from '../models/user.js';

let reservedUsernames = new Set();

const opts = {
    secretOrKey: process.env.SECRET_KEY,
    jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['jwtToken'];
        }
        return token;
    },
};

passport.use(
    new Strategy(opts, async (jwtPayload, done) => {
        const user = await UserModel.findByName(jwtPayload.username);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }),
);

passport.use(
    new LocalStrategy(async (username, password, done) => {
        if (!username || !password) {
            return done(new Error('Missing credentials'));
        }
        UserModel.findByName(username.toLowerCase()).then(
            (user) => {
                if (checkPasswordForUser(user, password)) {
                    return done(null, user);
                }
                return done(null, false);
            },
            (err) => {
                return done(err);
            },
        );
    }),
);

function initAuthController(config) {
    try {
        const data = readFileSync(
            config.get('reservedUsernamesRegistry'),
            'utf8',
        );
        data.split('\n')
            .filter((line) => line.trim() !== '')
            .forEach((username) => {
                reservedUsernames.add(username);
            });
    } catch (error) {
        console.error('Failed to parse reserved usernames:', error);
    }
}

// Function to handle Socket.IO connections and user status updates
function handleSocketConnections(io) {
    io.on('connection', async (socket) => {
        let cookie = socket.request.headers.cookie;
        let jwtIndex = cookie.indexOf('jwtToken');
        let jwtToken = cookie.substring(jwtIndex).split('=')[1];

        let decodedUser, userId;
        try {
            decodedUser = jwt.verify(jwtToken, process.env.SECRET_KEY);
            await UserModel.updateStatus(decodedUser.username, 'ONLINE');
            userId = await UserModel.findIdByName(decodedUser.username);
            console.log('!!! ' + decodedUser.username + ' is ONLINE');
            userSocketMapping[userId] = socket.id;
        } catch (exception) {
            console.error(`failed to decode user from jwt, ${exception}`);
            return;
        }

        let user = await UserModel.findByName(decodedUser.username);
        let status = user.status;
        io.emit('userStatus', {
            username: decodedUser.username,
            loginStatus: 'ONLINE',
            status,
        });

        socket.on('disconnect', () => {
            // Remove the user from the mapping on disconnect
            delete userSocketMapping[Object.keys(userSocketMapping).find(key => userSocketMapping[key] === socket.id)];
        });

        socket.on('window-close', async (reason) => {
            // Update the user status in the database to 'OFFLINE'
            try {
                if (reason === 'INTENTIONAL_CLOSE') {
                    await UserModel.updateStatus(
                        decodedUser.username,
                        'OFFLINE',
                    );
                    console.log(
                        'Socket disconnect, ' +
                            decodedUser.username +
                            ' is OFFLINE',
                    );
                }
            } catch (error) {
                console.error('Error updating user status:', error);
                return;
            }
            // Emit 'userStatus' event to notify other clients
            io.emit('userStatus', {
                username: decodedUser.username,
                loginStatus: 'OFFLINE',
                status,
            });
        });
    });
}

function validUsername(username) {
    username = username.toLowerCase();
    return username.length < 3 || reservedUsernames.has(username)
        ? false
        : username;
}

function validPassword(password) {
    return password.length < 4 ? false : password;
}

function checkPasswordForUser(user, rawPassword) {
    if (!user) {
        return false;
    }
    const newHashedPasswd = crypto.pbkdf2Sync(
        rawPassword,
        user.salt,
        310000,
        32,
        'sha256',
    );
    return Buffer.compare(newHashedPasswd, user.passwordHash) === 0;
}

async function deauthenticateUser(req, res, next) {
    const token = req.cookies.jwtToken;
    const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decodedUser;

    // sets JWT to expired cookie, effectively removing authentication
    res.cookie('jwtToken', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });
    await UserModel.updateLoginStatus(req.user.username, 'OFFLINE');
    return next();
}

async function setJwtCookie(req, res, next) {
    const username = req.body.username.toLowerCase();
    const token = jwt.sign({ username }, process.env.SECRET_KEY, {
        expiresIn: '1h',
    });
    await UserModel.updateLoginStatus(username, 'ONLINE');
    res.cookie('jwtToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });
    return next();
}

async function checkUserAuthenticated(req, res, next) {
    const token = req.cookies.jwtToken;
    if (!token) {
        res.locals.isAuthenticated = false;
        return next();
    }
    try {
        const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decodedUser;
        res.locals.isAuthenticated = true;
    } catch (error) {
        // res.status(401).json({ message: 'Token expired or invalid' });
        res.locals.isAuthenticated = false;
    }
    return next();
}

async function validateUrlParam(req, res, next) {
    let userId = await UserModel.findIdByName(req.user.username);
    if (req.params.senderId != userId) {
        return res.status(403).json({ error: 'Illegal sender Id' });
    }
    let receiverIdExists = await UserModel.idExists(req.params.receiverId);
    if (!receiverIdExists) {
        return res.status(403).json({ error: 'Illegal receiver Id' });
    }
    return next();
}

/*
 * Save user to db with generated hashedPassword and salt
 * TODO: This should go to User controller
 */
async function create(req, res, next) {
    const { username, password } = req.body;
    let salt = crypto.randomBytes(16);
    let passwordHash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256');
    let user = new UserModel(
        username.toLowerCase(),
        passwordHash,
        salt,
        'OFFLINE',
        'UNDEFINED',
        new Date(Date.now()).toLocaleString(),
        'SUPERDUPERADMIN',
    );
    await user.persist();
    return next();
}

async function validateNewCredentials(req, res, next) {
    const { username, password, dryRun } = req.body;
    const checkedUsername = validUsername(username);
    const checkedPassword = validPassword(password);
    if (!checkedUsername) {
        return res.status(403).json({ error: 'Illegal username' });
    }
    if (!checkedPassword) {
        return res.status(403).json({ error: 'Illegal password' });
    }
    const user = await UserModel.findByName(checkedUsername);
    if (user) {
        if (!checkPasswordForUser(user, password)) {
            return res.status(403).json({ error: 'Username is already taken' });
        } else {
            // This case is handled on the client side
            return res.status(401).json({ error: 'User exists' });
        }
    }
    if (dryRun) {
        return res.status(200).json({});
    }
    res.locals.data = { checkedUsername, password };
    return next();
}

async function getAllUsers() {
    try {
        const users = await UserModel.getAllStatuses();
        return users;
    } catch (err) {
        return null;
    }
}

async function getCurrentUserId(req) {
    let userId = await UserModel.findIdByName(req.user.username);
    return userId;
}

export {
    userSocketMapping,
    initAuthController,
    setJwtCookie,
    handleSocketConnections,
    deauthenticateUser,
    checkUserAuthenticated,
    validateUrlParam,
    create,
    validateNewCredentials,
    reservedUsernames,
    getAllUsers,
    getCurrentUserId,
    validPassword,
    validUsername,
};
