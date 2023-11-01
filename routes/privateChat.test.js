import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import app from '../app.js';

beforeAll(() => {
    passport.use('jwt', new MockStrategy());
});

describe('private chat routes', () => {
    test('get /', async () => {
        const res = await request(app).get('/privateChat/1');
        expect(res.statusCode).toBe(200);
    });
});
