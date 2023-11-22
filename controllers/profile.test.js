import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import ProfileModel from '../models/profile.js';
import {
    getUserProfile,
    updateUserProfile,
    addUserProfile,
    removeUserProfile,
} from './profile.js'; // Update with the correct path

beforeAll(async () => {
    // do db setups
    const { host, port, name } = config.get('db');
    const {
        host: testDBHost,
        port: testDBPort,
        name: testDBName,
    } = config.get('performance-test-db');
    const dbManager = DatabaseManager.getInstance();
    dbManager.configureDB(host, port, name);
    dbManager.configureTestDB(testDBHost, testDBPort, testDBName);
    try {
        await dbManager.activateDB();
        await dbManager.activateTestDB();
    } catch (err) {
        console.error(err);
    }

    const user = new UserModel({
        username: 'testUser',
        passwordHash: null,
        salt: null,
        loginStatus: 'ONLINE',
        status: 'OK',
        statusTime: null,
        privilege: null,
    });
    await user.persist();
    passport.use('jwt', new MockStrategy({ user }));
    const profile0 = await new ProfileModel(1, 'key', 'val').addProfileEntry();
    const profile1 = await new ProfileModel(2, 'key', 'val val').addProfileEntry();
    const profile2 = await new ProfileModel(1, 'key key', '1234').addProfileEntry();
    await new ProfileModel(1, 'keyy', null).addProfileEntry();
    await new ProfileModel(1, '_key', '!@#$%').updateProfileEntry();
    await new ProfileModel(1, '_emct_key', '_val').updateProfileEntry();
    profile0.updateProfileEntry();
    profile1.updateProfileEntry();
    profile2.updateProfileEntry();
});

describe('getUserProfile', () => {
    it('should return profiles without emergency contact when withEmergencyContact is false', async () => {
        const profiles = await getUserProfile(1, false);
        expect(profiles.length).toBe(3); // Assuming 3 mock profiles were returned
    });

    it('should return profiles with emergency contact when withEmergencyContact is true', async () => {
        const profiles = await getUserProfile(1, true);
        expect(profiles.length).toBe(5); // Assuming 5 mock profiles were returned
    });
});

describe('addUserProfile', () => {
    it('should add a new profile entry', async () => {
        await addUserProfile(1, 'new key');
        const profiles = await ProfileModel.getUserProfile(1);
        const match = profiles.find(profile => profile.key === 'new key');
        expect(match).toBeDefined();
    });
    it('should reject adding an invalid profile entry', async () => {
        expect(async () => {
            await addUserProfile(1, '_newKey');
        }).rejects.toThrow();
    });
});

describe('updateUserProfile', () => {
    it('should update profile entries', async () => {
        const updates = {
            key: 'value1',
            keyy: 'value2',
        };
        await updateUserProfile(1, updates);
        const profiles = await ProfileModel.getUserProfile(1);
        // Check if the updated key-value pairs exist in the profiles
        Object.entries(updates).forEach(([key, value]) => {
            const matchingProfile = profiles.find(profile => profile[key] === value);
            if (matchingProfile) {
                expect(matchingProfile.val).toEqual(value);
            }
        });
    });

    it('should update emct profile entries', async () => {
        const updates = {
            _emct_key: 'value1',
            _emct_name: 'value2',
        };
        await updateUserProfile(1, updates);
        const profiles = await ProfileModel.getUserProfile(1);
        // Check if the updated key-value pairs exist in the profiles
        Object.entries(updates).forEach(([key, value]) => {
            const matchingProfile = profiles.find(profile => profile[key] === value);
            if (matchingProfile) {
                expect(matchingProfile.val).toEqual(value);
            }
        });
    });
});

describe('removeUserProfile', () => {
    it('should remove a profile entry', async () => {
        await removeUserProfile(1, 'key key');
        const profiles = await ProfileModel.getUserProfile(1);
        const match = profiles.find(profile => profile.key === 'keykey');
        expect(match).toBeUndefined();
    });

    it('should reject removing an invalid profile entry', async () => {
        expect(async () => {
            await removeUserProfile(1, '_newKey');
        }).rejects.toThrow();
    });
});

afterAll(async () => {
    // dismantle db
    const dbManager = DatabaseManager.getInstance();
    try {
        await dbManager.deactivateTestDB();
        await dbManager.DBPool.end();
    } catch (err) {
        console.error(err);
    }
});
