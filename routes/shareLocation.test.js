import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import config from 'config';
import app from '../app.js';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import LocationModel from '../models/location.js';

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
    await user.persist();
    const user2 = new UserModel({
        username: 'testUser2',
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    user2.id = 2;
    await user2.persist();
    await new UserModel({
        username: 'otherUser0',
        loginStatus: 'OFFLINE',
        status: 'OK',
        privilege: null,
    }).persist();
    await new LocationModel({
        sender_id: 1,
        address: '300 River Oaks Pkwy',
        city: 'San Jose',
        state: 'CA',
        latitude: 36.01225685,
        longitude: -78.95004593,
        time: new Date(1),
    }).persist();
    passport.use('jwt', new MockStrategy({ user }));
});

describe('Share Current Location usecase tests', () => {
    test('get all current locations', async () => {
        const res = await request(app).get('/locations/all');
        expect(res.statusCode).toBe(200);
    });

    test('share a current location', async () => {
        const res = await request(app).post('/locations').send({
            address: '300 River Oaks Pkwy',
            city: 'San Jose',
            state: 'CA',
        });
        expect(res.statusCode).toBe(409);
    });

    test('Get current location', async () => {
        const res = await request(app).get('/locations/1');
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
