import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import config from 'config';
import app from '../app.js';
import DatabaseManager from '../db.js';

beforeAll(async () => {
    passport.use('jwt', new MockStrategy());
    // do db setups
    const dbHost = config.get('db.host');
    const dbPort = config.get('db.port');
    const dbName = config.get('db.name');
    const testDBHost = config.get('performance-test-db.host');
    const testDBPort = config.get('performance-test-db.port');
    const testDBName = config.get('performance-test-db.name');
    const dbManager = DatabaseManager.getInstance();
    dbManager.configureDB(dbHost, dbPort, dbName);
    dbManager.configureTestDB(testDBHost, testDBPort, testDBName);
    try {
        await dbManager.activateDB();
        await dbManager.activateTestDB();
    } catch (err) {
        console.error(err);
    }
});

describe('status routes', () => {
    test('get status page', async () => {
        const res = await request(app).get('/status');
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
