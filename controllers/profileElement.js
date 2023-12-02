import UserModel from '../models/user.js';
import { validUsername, validPassword } from './auth.js';

const invalidProfileChanges = 'Invalid profile changes';
const userNotFound = 'User not found';

function getUserProfileElements(userID) {
    return UserModel.findByID(userID).then((user) => buildUserProfile(user));
}

/**
 * Updates the provided fields on the user identified by userID, if possible.
 * @param {*} userID
 * @param {*} fields
 * @returns Object indicating whether the update was successful, or what errors occurred.
 * {
 *      updated: bool,     // indicates whether the user profile elements were updated
 *      errors: array,     // indicates which errors occurred during update
 * }
 */
async function updateUserProfileElements(userID, fields) {
    const change = await validProfileChanges(fields);
    if (!change.valid) {
        return {
            updated: false,
            reason: invalidProfileChanges,
            errors: change.errors,
        };
    }

    // create new passwordHash and salt, if updated
    if (fields.password) {
        fields.salt = crypto.randomBytes(16);
        fields.passwordHash = crypto.pbkdf2Sync(
            fields.password,
            fields.salt,
            310000,
            32,
            'sha256',
        );
    }

    const userProfile = await UserModel.updateByID(userID, fields);
    if (userProfile === null) {
        return {
            updated: false,
            reason: userNotFound,
        };
    }
    return { updated: true };
}

/**
 * Build User Profile in accordance with "User Profile Rule"
 * @param {*} user
 * @returns User Profile
 */
function buildUserProfile(user) {
    return {
        accountStatus: user.accountStatus,
        privilegeLevel: user.privilege,
        username: user.username,
    };
}

/**
 * Validates suggested changes to user profile elements.
 *
 * @param {*} fields Profile elements to update
 * @returns Object indicating whether the changes are valid.
 * It takes the following form:
 * {
 *      valid: bool,     // indicates whether the changes are valid
 *      errors: array,   // indicates which errors occurred during validation
 * }
 */
async function validProfileChanges(fields) {
    const errors = [];
    if (fields.accountStatus && !validAccountStatus(fields.accountStatus)) {
        errors.push('Invalid account status');
    }
    if (fields.privilegeLevel && !validPrivilegeLevel(fields.privilegeLevel)) {
        errors.push('Invalid privilege level');
        // TODO: if privileges of an admin are being revoked, check that
        // there is at least one more admin in the system (See At-least-one-administrator rule)
    }
    if (fields.username && !validUsername(fields.username)) {
        errors.push('Invalid username');
    } else {
        const user = await UserModel.findByName(fields.username);
        if (user !== null) {
            errors.push('Username already taken');
        }
    }
    if (fields.password && !validPassword(fields.password)) {
        errors.push('Invalid password');
    }
    if (errors.length !== 0) {
        return {
            valid: false,
            errors,
        };
    }
    return {
        valid: true,
        errors: null,
    };
}

function validAccountStatus(accountStatus) {
    return accountStatus === 'ACTIVE' || accountStatus === 'INACTIVE';
}

function validPrivilegeLevel(privilegeLevel) {
    return (
        privilegeLevel === 'ADMIN' ||
        privilegeLevel === 'COORDINATOR' ||
        privilegeLevel === 'CITIZEN'
    );
}

export {
    getUserProfileElements,
    updateUserProfileElements,
    invalidProfileChanges,
    userNotFound,
};
