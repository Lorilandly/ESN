import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import { readFileSync } from 'fs';
import UserModel from '../models/user.js';

const reservedUsernames = new Set();

const opts = {
    secretOrKey: process.env.SECRET_KEY,
    jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies.jwtToken;
        }
        return token;
    },
};

passport.use(
    new Strategy(opts, async (jwtPayload, done) => {
        return UserModel.findByName(jwtPayload.username)
            .then((user) => {
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            })
            .catch((err) => done(err));
    }),
);

passport.use(
    new LocalStrategy(async (username, password, done) => {
        if (!username || !password) {
            return done(new Error('Missing credentials'));
        }
        return UserModel.findByName(username.toLowerCase())
            .then((user) => {
                if (checkPasswordForUser(user, password)) {
                    return done(null, user);
                }
                return done(null, false);
            })
            .catch((err) => done(err));
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
        const cookie = socket.request.headers.cookie;
        let decodedUser;
        try {
            const jwtIndex = cookie.indexOf('jwtToken');
            const jwtToken = cookie.substring(jwtIndex).split('=')[1];
            decodedUser = jwt.verify(jwtToken, process.env.SECRET_KEY);
            await UserModel.updateLoginStatus(decodedUser.username, 'ONLINE');
        } catch (exception) {
            console.error(`failed to decode user from jwt, ${exception}`);
            return;
        }
        const user = await UserModel.findByName(decodedUser.username);
        const status = user.status;
        io.emit('userStatus', {
            username: decodedUser.username,
            loginStatus: 'ONLINE',
            status,
        });

        socket.on('disconnect', async () => {
            // Remove the user from the mapping on disconnect
            io.emit('userStatus', {
                username: decodedUser.username,
                loginStatus: 'OFFLINE',
                status,
            });
            await UserModel.updateLoginStatus(decodedUser.username, 'OFFLINE');
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
    // If the user is intentionally logging out, we want to remove the cookie
    if (req.body.type === 'logout') {
        res.cookie('jwtToken', '', {
            expires: new Date(0),
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
        });
    }
    await UserModel.updateLoginStatus(req.user.username, 'OFFLINE');
    return next();
}

async function setJwtCookie(username, res) {
    const token = jwt.sign({ username }, process.env.SECRET_KEY, {
        expiresIn: '1h',
    });
    return UserModel.updateLoginStatus(username, 'ONLINE').then(() => {
        res.cookie('jwtToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
        });
        return res;
    });
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

export {
    initAuthController,
    setJwtCookie,
    handleSocketConnections,
    deauthenticateUser,
    checkUserAuthenticated,
    validateNewCredentials,
    reservedUsernames,
    validPassword,
    validUsername,
};
