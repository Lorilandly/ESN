import UserModel from '../models/user.js';

/*
 * Save user to db with generated hashedPassword and salt
 */
async function create(username, password) {
    const user = new UserModel({
        username: username.toLowerCase(),
        loginStatus: 'OFFLINE',
        status: 'UNDEFINED',
        privilege: 'CITIZEN',
        accountStatus: 'ACTIVE',
    });
    user.setPassword(password);
    return user.persist();
}

async function getAllActiveUsers() {
    return UserModel.getAllStatuses();
}

async function getAllUsers() {
    return UserModel.getAllUsers();
}

async function getUserByName(username) {
    return await UserModel.findByName(username);
}

export { create, getAllActiveUsers, getAllUsers, getUserByName };
