import request from 'supertest';
import express from 'express';
import statusRouter from './status.js';

const app = new express();
app.use('/', statusRouter);

describe('status routes', () => {
    test('get /', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200); // This cannot pass because passport is not initialized yet
    });
})
