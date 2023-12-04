import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import config from 'config';
import app from '../app.js';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import ProfileModel from '../models/profile.js';

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
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    user.id = 1;
    user.activePrivilegeLevel = 'ADMIN';
    await user.persist();
    passport.use('jwt', new MockStrategy({ user }));
    await new ProfileModel(2, '_emct_key', '_val').updateProfileEntry();
    const profile0 = await new ProfileModel(1, 'key', 'val').addProfileEntry();
    await profile0.updateProfileEntry();
});

describe('Share Status usecases tests', () => {
    test('get status endpoint', async () => {
        const res = await request(app).get('/users/status');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
    });

    test('put status endpoint', async () => {
        const res = await request(app)
            .put('/users/status')
            .send({ status: 'HELP' });
        expect(res.statusCode).toBe(200);
        expect(
            await UserModel.findByName('testUser').then((user) => user.status),
        ).toBe('HELP');
    });
});

describe('Profile usecase tests', () => {
    it('should retrieve current user profile', async () => {
        const res = await request(app).get('/users/profile');
        expect(res.statusCode).toBe(200);
        expect(res.body[0]).toEqual(new ProfileModel(1, 'key', 'val'));
    });
    it('should retrieve other user profile', async () => {
        const res = await request(app).get('/users/1/profile');
        expect(res.statusCode).toBe(200);
        expect(res.body[0]).toEqual(new ProfileModel(1, 'key', 'val'));
    });
    it('should not include emct entry in other user profile', async () => {
        const res = await request(app).get('/users/2/profile');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0);
    });
    it('should fail to add a reserved entry', async () => {
        const res = await request(app)
            .post('/users/profile')
            .send({ key: '_reserved' });
        expect(res.statusCode).toBe(400);
    });
    it('should add a new profile entry', async () => {
        const res = await request(app)
            .post('/users/profile')
            .send({ key: 'new key' });
        expect(res.statusCode).toBe(200);
        const profiles = await ProfileModel.getUserProfile(1);
        const match = profiles.find((profile) => profile.key === 'new key');
        expect(match).toBeDefined();
    });
    it('should update an existing profile entry', async () => {
        const res = await request(app)
            .put('/users/profile')
            .send({ key: 'changed' });
        expect(res.statusCode).toBe(200);
        const profiles = await ProfileModel.getUserProfile(1);
        const match = profiles.find((profile) => profile.key === 'key');
        expect(match.val).toEqual('changed');
    });
    it('should remove an existing profile entry', async () => {
        const res = await request(app)
            .delete('/users/profile')
            .send({ key: 'key' });
        expect(res.statusCode).toBe(200);
        const profiles = await ProfileModel.getUserProfile(1);
        const match = profiles.find((profile) => profile.key === 'key');
        expect(match).toBeUndefined();
    });
});

describe('Send help usecase tests', () => {
    it('should fail on user without emct email', async () => {
        const res = await request(app).get('/users/help');
        expect(res.statusCode).toBe(400);
    });
});

describe('Admin User Profile usecase tests', () => {
    it('should update username in user profile', async () => {
        const res = await request(app).put('/users/1').send({
            username: 'testName',
        });
        expect(res.statusCode).toBe(200);
    });
    it('should fail to update user profile with invalid id', async () => {
        const res = await request(app).put('/users/5').send({
            username: 'test',
            privilegeLevel: 'CITIZEN',
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User not found');
    });
    it('should update password in user profile', async () => {
        const res = await request(app).put('/users/1').send({
            password: 'testPassword',
        });
        expect(res.statusCode).toBe(200);
    });
    it('should update account status in user profile', async () => {
        const res = await request(app).put('/users/1').send({
            privilegeLevel: 'CITIZEN',
        });
        expect(res.statusCode).toBe(200);
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
