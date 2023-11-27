import nodemailer from 'nodemailer';
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
                withEmergencyContact ? true : !profile.reservedEntry(),
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

async function sendHelp(user) {
    const emctEmail = await getUserProfile(user.id, true).then((res) =>
        res.find((entry) => entry.key === '_emct_email'),
    );
    if (!emctEmail || !emctEmail.val) {
        throw new Error('Emergency contact email address not set.');
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'esn8306@gmail.com',
            pass: 'peirzddetpadmvji',
        },
    });

    const mailOptions = {
        from: 'esn8306@gmail.com',
        to: emctEmail.val,
        subject: 'Request for help',
        text: `${user.username} needs your help!`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            throw err;
        } else {
            return 'Email sent: ' + info.response;
        }
    });
}

export {
    getUserProfile,
    updateUserProfile,
    addUserProfile,
    removeUserProfile,
    sendHelp,
};
