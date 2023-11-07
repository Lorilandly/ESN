import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import app from '../app.js';

beforeAll(async () => {
    passport.use('jwt', new MockStrategy());
});

describe('status routes', () => {
    test('get status page', async () => {
        const res = await request(app).get('/status');
        expect(res.statusCode).toBe(200);
    });
});
