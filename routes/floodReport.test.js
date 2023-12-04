import MockedSocket from 'socket.io-mock';
import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import config from 'config';
import app from '../app.js';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import FloodReportModel from '../models/floodReport.js';
import {
    initFloodReportController,
    invalidAddressMessage,
    invalidCityMessage,
    invalidStateMessage,
    invalidZipcodeMessage,
    invalidDescriptionMessage,
} from '../controllers/floodReport.js';

beforeAll(async () => {
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
    const testUser = new UserModel({
        username: 'testUser',
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    testUser.id = await testUser.persist();

    passport.use('jwt', new MockStrategy({ testUser }));
    initFloodReportController(new MockedSocket(), config.get('flood-report'));
});

describe('Create and Cancel Flood Report usecase tests', () => {
    test('Requesting all floodReports when exists returns 200', async () => {
        const testFloodReport = new FloodReportModel({
            address: '1234 NE 56th St',
            city: 'Albany',
            state: 'NY',
            zipcode: '78900',
            description: 'Everything will be washed away!',
            time: new Date(1).toLocaleString(),
        });
        testFloodReport.id = await testFloodReport.persist();

        const res = await request(app).get('/floodReports');
        expect(res.statusCode).toBe(200);
        expect(res.body.floodReports).toContainEqual(testFloodReport);
    });

    test('Normal flow creates new report with status 201', async () => {
        const floodReportData = {
            address: '1234 NE 56th St',
            city: 'Albany',
            state: 'NY',
            zipcode: '78900',
            description: 'Everything will be washed away!',
        };
        const res = await request(app)
            .post('/floodReports')
            .send(floodReportData);
        expect(res.statusCode).toBe(201);
    });

    test('Creating invalid floodReport with single invalid field returns status 400', async () => {
        const floodReportData = {
            address: '12345',
            city: 'Az',
            state: 'ZY',
            zipcode: '00000',
            description: 'a'.repeat(200),
        };
        const res = await request(app)
            .post('/floodReports')
            .send(floodReportData);
        expect(res.statusCode).toBe(400);
    });

    test('Creating floodReport with multiple invalid fields returns multiple error reasons', async () => {
        const floodReportData = {
            address: '1234',
            city: 'A',
            state: 'ZY',
            zipcode: '0000',
            description: 'a'.repeat(201),
        };
        const res = await request(app)
            .post('/floodReports')
            .send(floodReportData);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContainEqual(invalidAddressMessage);
        expect(res.body.errors).toContainEqual(invalidCityMessage);
        expect(res.body.errors).toContainEqual(invalidStateMessage);
        expect(res.body.errors).toContainEqual(invalidZipcodeMessage);
        expect(res.body.errors).toContainEqual(invalidDescriptionMessage);
    });

    test('Cancel Flood Report normal flow returns status 200', async () => {
        const testFloodReport = new FloodReportModel({
            address: '1234 NE 56th St',
            city: 'Albany',
            state: 'NY',
            zipcode: '78900',
            description: 'Everything will be washed away!',
            time: new Date(1).toLocaleString(),
        });
        testFloodReport.id = await testFloodReport.persist();
        const res = await request(app).delete(
            '/floodReports/' + testFloodReport.id,
        );
        expect(res.statusCode).toBe(200);
    });

    test('Canceling nonexistent Flood Report returns status 404', async () => {
        const res = await request(app).delete('/floodReports/10');
        expect(res.statusCode).toBe(404);
    });
});

afterAll(async () => {
    const dbManager = DatabaseManager.getInstance();
    try {
        await dbManager.deactivateTestDB();
        await dbManager.DBPool.end();
    } catch (err) {
        console.error(err);
    }
});
