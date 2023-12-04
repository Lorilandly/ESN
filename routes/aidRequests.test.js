import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import config from 'config';
import app from '../app.js';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import AidRequestModel from '../models/aidRequest.js';

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
    const user = new UserModel({
        username: 'testUser',
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    user.id = 1;
    await user.persist();
    await new UserModel({
        username: 'otherUser0',
        loginStatus: 'OFFLINE',
        status: 'OK',
        privilege: null,
    }).persist();

    const req1 = new AidRequestModel({
        title: 'test',
        description: 'description',
        priority: 'Medium',
        creatorId: 1,
        acceptorId: 0,
        status: 'SUBMITTED',
    });
    await req1.persist();
    const req2 = new AidRequestModel({
        title: 'test2',
        description: 'description',
        priority: 'High',
        creatorId: 2,
        acceptorId: 1,
        status: 'ACCEPTED',
    });
    await req2.persist();

    passport.use('jwt', new MockStrategy({ user }));
});

test('get all aid requests', async () => {
    const res = await request(app).get('/aidRequests/all');
    expect(res.statusCode).toBe(200);
    expect(res.body.aidRequests[0].title).toBe('test');
    expect(res.body.aidRequests[1].title).toBe('test2');
});

test('get submitted aid requests', async () => {
    const res = await request(app).get('/aidRequests/submitted');
    expect(res.body.aidRequests[0].title).toBe('test');
});

test('get aid request success', async () => {
    const res = await request(app).get('/aidRequests/all/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.aidRequest.title).toBe('test');
});

test('get aid request failure', async () => {
    const res = await request(app).get('/aidRequests/all/err');
    expect(res.statusCode).toBe(500);
});

test('get accepted aid requests', async () => {
    const res = await request(app).get('/aidRequests/accepted');
    expect(res.body.aidRequests[0].title).toBe('test2');
});

test('post new aid request success', async () => {
    const res = await request(app)
        .post('/aidRequests/')
        .send({ title: 'new', description: 'test req', priority: 'High' });
    expect(res.statusCode).toBe(201);
    const getRes = await request(app).get('/aidRequests/all');
    expect(getRes.body.aidRequests[0].title).toBe('new');
});

test('update aid request', async () => {
    const res = await request(app)
        .put('/aidRequests/all/1')
        .send({ title: 'update', description: 'test req', priority: 'Low' });
    expect(res.statusCode).toBe(200);
    const getRes = await request(app).get('/aidRequests/all');
    expect(getRes.body.aidRequests[1].title).toBe('update');
});

test('delete aid request', async () => {
    const res = await request(app).delete('/aidRequests/1');
    expect(res.statusCode).toBe(200);
    const getRes = await request(app).get('/aidRequests/all');
    expect(getRes.body.aidRequests[1].title).toBe('test2');
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
