import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import app from '../app.js';
import DatabaseManager from '../db.js';

beforeAll(() => {
    passport.use('jwt', new MockStrategy());
    // do db setups
    // const dbManager = DatabaseManager.getInstance();
    // dbManager.configureTestDB();
    // dbManager.activateTestDB();
});

describe('status routes', () => {
    test('get /', async () => {
        const res = await request(app).get('/status');
        expect(res.statusCode).toBe(200);
    });
});

afterAll(() => {
    // dismantle db
    // const dbManager = DatabaseManager.getInstance();
    // dbManager.deactivateTestDB();
});
