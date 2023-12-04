import crypto from 'crypto';
import UserModel from '../models/user.js';
import { validUsername, validPassword } from './auth.js';

const invalidProfileChanges = 'Invalid profile changes';
const userNotFound = 'User not found';

let ioInstance = null;

function initIOInstanceForAdmin(io) {
    ioInstance = io;
}

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
    // create new passwordHash and salt, if updated
    if ('password' in fields) {
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

    if (fields.accountStatus === 'INACTIVE') {
        ioInstance.emit('user inactive', { userID });
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
async function validProfileChanges(userID, fields) {
    const errors = [];
    if (
        'accountStatus' in fields &&
        !validAccountStatus(fields.accountStatus)
    ) {
        errors.push('Invalid account status');
    }
    if (
        'privilegeLevel' in fields &&
        !validPrivilegeLevel(fields.privilegeLevel)
    ) {
        errors.push('Invalid privilege level');
    } else {
        // if the privileges of an admin are being revoked, check that there
        // is at least one more admin in the system (at least one admin rule)
        if (!(await atLeastOneAdmin(fields.privilegeLevel, userID))) {
            errors.push('There must always be one admin must in the system');
        }
    }

    if ('username' in fields) {
        const username = validUsername(fields.username);
        if (username) {
            const user = await UserModel.findByName(fields.username);
            if (user !== null && user.id !== parseInt(userID)) {
                errors.push('Username already taken');
            }
            // enforce case sensitivity, as with other usenames
            fields.username = username;
        } else {
            errors.push('Invalid username');
        }
    }
    if ('password' in fields && !validPassword(fields.password)) {
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
    };
}

async function profileChangeValidation(userID, fields) {
    const change = await validProfileChanges(userID, fields);
    if (!change.valid) {
        return {
            updated: false,
            reason: invalidProfileChanges,
            errors: change.errors,
        };
    }
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

async function atLeastOneAdmin(privilegeLevel, userID) {
    if (privilegeLevel !== 'ADMIN') {
        const oldPrivilegeLevel = await UserModel.getPrivilegeByID(userID);
        if (oldPrivilegeLevel === 'ADMIN') {
            const count = await UserModel.countAdmins();
            return count > 1;
        }
    }
    return true;
}

export {
    getUserProfileElements,
    updateUserProfileElements,
    initIOInstanceForAdmin,
    profileChangeValidation,
    validProfileChanges,
    atLeastOneAdmin,
    invalidProfileChanges,
    userNotFound,
};
