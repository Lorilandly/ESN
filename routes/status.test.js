import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import app from '../app.js';

describe('status routes', () => {
    test('get /', async () => {
        passport.use('jwt', new MockStrategy());

        const res = await request(app).get('/status');
        expect(res.statusCode).toBe(200);
    });
});
