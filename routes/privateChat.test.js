import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import app from '../app.js';

describe('private chat routes', () => {
    test('get /', async () => {
        passport.use('jwt', new MockStrategy());

        const res = await request(app).get('/privateChat/1');
        expect(res.statusCode).toBe(200);
    });
});

