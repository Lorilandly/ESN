import UserModel from '../models/user.js';

function getUserProfileElements(userID) {
    return UserModel.findByID(userID).then((user) => buildUserProfile(user));
}

// Build User Profile in accordance with "User Profile Rule"
function buildUserProfile(user) {
    return {
        accountStatus: user.accountStatus,
        privilegeLevel: user.privilege,
        username: user.username,
    };
}

export { getUserProfileElements };
