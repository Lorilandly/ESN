import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import { readFileSync } from 'fs';
import UserModel from '../models/user.js';

let reservedUsernames = null;

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
        reservedUsernames = new Set(
            data.split('\n').filter((line) => line.trim() !== ''),
        );
    } catch (error) {
        console.error('Failed to parse reserved usernames:', error);
    }
}

// Function to handle Socket.IO connections and user status updates
function handleSocketConnections(io) {
    io.on('connection', (socket) => {
        let cookie = socket.request.headers.cookie;
        let jwtIndex = cookie.indexOf('jwtToken');
        let jwtToken = cookie.substring(jwtIndex).split('=')[1];

        let decodedUser;
        try {
            decodedUser = jwt.verify(jwtToken, process.env.SECRET_KEY);
        } catch (exception) {
            console.error(`failed to decode user from jwt, ${exception}`);
        }

        io.emit('userStatus', {
            username: decodedUser.username,
            status: 'ONLINE',
        });

        // Handle user disconnection for offline status
        socket.on('disconnect', async () => {
            // Update the user status in the database to 'OFFLINE'
            try {
                await UserModel.updateStatus(decodedUser.username, 'OFFLINE');
            } catch (error) {
                console.error('Error updating user status:', error);
            }
            // Emit 'userStatus' event to notify other clients
            io.emit('userStatus', {
                username: decodedUser.username,
                status: 'OFFLINE',
            });
        });
    });
}

function validUsername(username) {
    return !(username.length < 3 || reservedUsernames.has(username));
}

function validPassword(password) {
    return !(password.length < 4);
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
    await UserModel.updateStatus(req.user.username, 'OFFLINE');
    return next();
}

async function sendJwtCookie(req, res, next) {
    const username = req.body.username;
    const token = jwt.sign({ username }, process.env.SECRET_KEY, {
        expiresIn: '1h',
    });
    await UserModel.updateStatus(username, 'ONLINE');
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
        'DEAD',
        'SUPERDUPERADMIN',
    );
    await user.persist();
    return next();
}

async function validateNewCredentials(req, res, next) {
    const { username, password, dryRun } = req.body;
    if (!validUsername(username.toLowerCase())) {
        return res.status(403).json({ error: 'Illegal username' });
    }
    if (!validPassword(password)) {
        return res.status(403).json({ error: 'Illegal password' });
    }
    const user = await UserModel.findByName(username.toLowerCase());
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
    res.locals.data = { username, password };
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

export {
    initAuthController,
    sendJwtCookie,
    handleSocketConnections,
    deauthenticateUser,
    checkUserAuthenticated,
    create,
    validateNewCredentials,
    getAllUsers,
};
