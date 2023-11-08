import crypto from 'crypto';
import UserModel from '../models/user.js';

/*
 * Save user to db with generated hashedPassword and salt
 */
async function create(username, password) {
    const salt = crypto.randomBytes(16);
    const passwordHash = crypto.pbkdf2Sync(
        password,
        salt,
        310000,
        32,
        'sha256',
    );
    const user = new UserModel({
        username: username.toLowerCase(),
        passwordHash: passwordHash,
        salt:  salt,
        loginStatus: 'OFFLINE',
        status: 'UNDEFINED',
        statusTime: new Date(Date.now()).toLocaleString(),
        privilege: 'SUPERDUPERADMIN',
    });
    return user.persist();
}

async function getAllUsers() {
    return UserModel.getAllStatuses();
}

async function getUserByName(username) {
    return await UserModel.findByName(username);
}

export { create, getAllUsers, getUserByName };
