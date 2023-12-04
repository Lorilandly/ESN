import UserModel from '../models/user.js';

/*
 * Save user to db with generated hashedPassword and salt
 */
async function create(username, password) {
    const user = new UserModel({
        username: username.toLowerCase(),
        loginStatus: 'OFFLINE',
        status: 'UNDEFINED',
        privilege: 'SUPERDUPERADMIN',
    });
    user.setPassword(password);
    return user.persist();
}

async function getAllUsers() {
    return UserModel.getAllStatuses();
}

async function getUserByName(username) {
    return await UserModel.findByName(username);
}

export { create, getAllUsers, getUserByName };
