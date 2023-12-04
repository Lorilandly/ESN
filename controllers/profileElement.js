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
    await validProfileChanges(userID, fields);

    if ('username' in fields) {
        fields.username = validUsername(fields.username);
    }

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
        throw new Error(userNotFound);
    }

    if (fields.accountStatus === 'INACTIVE') {
        ioInstance.emit('user inactive', { userID });
    }
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
    if (
        'accountStatus' in fields &&
        !validAccountStatus(fields.accountStatus)
    ) {
        throw new Error('Invalid account status');
    }
    if (
        'privilegeLevel' in fields &&
        !validPrivilegeLevel(fields.privilegeLevel)
    ) {
        throw new Error('Invalid privilege level');
    } else {
        // if the privileges of an admin are being revoked, check that there
        // is at least one more admin in the system (at least one admin rule)
        if (
            !(await atLeastOneAdmin(
                fields.privilegeLevel,
                fields.accountStatus,
                userID,
            ))
        ) {
            throw new Error('At least one administrator must exist');
        }
    }

    if ('username' in fields) {
        const username = validUsername(fields.username);
        if (!username) {
            throw new Error('Invalid username');
        }
        if (username) {
            const user = await UserModel.findByName(fields.username);
            if (user !== null && user.id !== parseInt(userID)) {
                throw new Error('Username already taken');
            }
        } else {
            throw new Error('Invalid username');
        }
    }
    if ('password' in fields && !validPassword(fields.password)) {
        throw new Error('Invalid password');
    }
}

/**
 * Throws Error if one of the fields is invalid, otherwise does nothing.
 * @param {*} userID
 * @param {*} fields
 * @throws Error with description of invalid field
 */
async function profileChangeValidation(userID, fields) {
    await validProfileChanges(userID, fields);
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

async function atLeastOneAdmin(privilegeLevel, accountStatus, userID) {
    // check privilegeLevel and accountStatus not null
    const user = await UserModel.findByID(userID);
    if (user.privilege === 'ADMIN' && user.accountStatus === 'ACTIVE') {
        if (privilegeLevel !== 'ADMIN' || accountStatus !== 'ACTIVE') {
            return (await UserModel.countAdmins()) > 1;
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
