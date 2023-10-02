import crypto from 'crypto';
import { readFileSync } from 'fs';
import UserModel from '../models/user.js';
import jwt from 'jsonwebtoken';

let reservedUsernames = null;

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

function deauthenticateUser(req, res, next) {
    // sets JWT to expired cookie, effectively removing authentication
    res.cookie('jwtToken', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });
    next();
}

async function authenticateUser(req, res, next) {
    const username = req.body.username;
    const token = jwt.sign({ username }, process.env.SECRET_KEY, {
        expiresIn: '1h',
    });
    res.cookie('jwtToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });
    next();
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
        // User is authenticated, need to fetch all user from db
        const users = await UserModel.getAll();
        res.locals.users = users;

    } catch (error) {
        // res.status(401).json({ message: 'Token expired or invalid' });
        res.locals.isAuthenticated = false;
    }
    next();
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
    next();
}

async function validateUsernamePassword(req, res, next) {
    const { username, password } = req.body;
    let msg;
    if (!validUsername(username)) {
        msg = 'bad username';
    }
    if (!validPassword(password)) {
        msg = 'bad password';
    }
    // TODO: This will be modified while fleshing out login/logout flows
    const user = await UserModel.findByName(username.toLowerCase());
    if (user) {
        if (!checkPasswordForUser(user, password)) {
            msg = 'username taken';
        } else {
            msg = 'login';
        }
    }
    res.locals.data = { username, password, msg };
    next();
}

export {
    initAuthController,
    authenticateUser,
    deauthenticateUser,
    checkUserAuthenticated,
    create,
    validateUsernamePassword,
};
