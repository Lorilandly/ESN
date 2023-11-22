import ProfileModel from '../models/profile.js';

/**
 * Get profile for user
 * @param {number} id User ID
 * @param {boolean} withEmergencyContact
 * @returns {Array<Profile>} An array of Profile entry objects.
 */
async function getUserProfile(id, withEmergencyContact) {
    return ProfileModel.getUserProfile(id, withEmergencyContact).then(
        (profiles) =>
            profiles.filter((profile) =>
                withEmergencyContact ? true : !profile.emergencyEntry(),
            ),
    );
}

async function updateUserProfile(id, updates) {
    const pairs = new Map(Object.entries(updates));
    return pairs.forEach(async (val, key, _) => {
        await new ProfileModel(id, key, val).updateProfileEntry();
    });
}

/**
 * @param {number} id
 * @param {string} key
 */
async function addUserProfile(id, key) {
    return new ProfileModel(id, key, null).addProfileEntry();
}

/**
 * @param {number} id
 * @param {string} key
 */
async function removeUserProfile(id, key) {
    return new ProfileModel(id, key, null).removeProfileEntry();
}

export { getUserProfile, updateUserProfile, addUserProfile, removeUserProfile };
