import 'dotenv/config';
import request from 'supertest';
import app from '../app.js';
import jwt from 'jsonwebtoken';
import DatabaseManager from '../db.js';
import config from 'config';

const mockAuthenticate = jest.fn();
jest.mock('passport', () => ({
    authenticate: mockAuthenticate,
}));

describe('GET /users/status', () => {
    let token;
    let dbManager = DatabaseManager.getInstance();

    beforeAll(async () => {
        const DBHost = config.get('share-status-db.host');
        const DBPort = config.get('share-status-db.port');
        const DBName = config.get('share-status-db.name');
        dbManager.configureDB(DBHost, DBPort, DBName);
        const testUserId = await dbManager.activateDB();

        mockAuthenticate.mockImplementation(() => (req, res, next) => {
            req.user = { id: testUserId };  
            next();
        });

        token = jwt.sign({ id: testUserId }, '--');
    });

    // afterAll(async () => {
    //     await dbManager.deactivateTestDB();
    // });

    it('Return user status when authenticated', async () => {
        const response = await request(app)
            .get('/users/status')
            .set('cookie', [`jwtToken=${token}`]);
        console.log(`response: ${JSON.stringify(response)}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'UNDEFINED' });
    });

    it('Return 401 error if not authenticated', async () => {
        const response = await request(app).get('/users/status');
        expect(response.statusCode).toBe(401);
    });
});

describe('POST /users/status', () => {
    let token;
    let dbManager = DatabaseManager.getInstance();

    beforeAll(async () => {
        const DBHost = config.get('share-status-db.host');
        const DBPort = config.get('share-status-db.port');
        const DBName = config.get('share-status-db.name');
        dbManager.configureDB(DBHost, DBPort, DBName);
        const testUserId = await dbManager.activateDB();

        mockAuthenticate.mockImplementation(() => (req, res, next) => {
            req.user = { id: testUserId };  
            next();
        });

        token = jwt.sign({ id: testUserId }, '--');
    });

    it('Update user status and return status code 200 when authenticated', async () => {
        const newStatus = 'OFFLINE'; 

        const response = await request(app)
            .post('/users/status')
            .set('cookie', [`jwtToken=${token}`])
            .send({ status: newStatus });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({});

    });

    it('Return status code 401 if not authenticated', async () => {
        const response = await request(app).post('/users/status');
        expect(response.statusCode).toBe(401);
    });

});