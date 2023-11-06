import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import config from 'config';
import app from '../app.js';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';

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
    const user = new UserModel(
        'testUser',
        null,
        null,
        false,
        'UNDEFINED',
        null,
        null,
    );
    await user.persist();
    passport.use('jwt', new MockStrategy({ user }));
});

describe('status routes', () => {
    test('get status endpoint', async () => {
        const res = await request(app).get('/users/status');
        expect(res.statusCode).toBe(200);
    });
    test('put status endpoint', async () => {
        const res = await request(app).post('/users/status');
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
