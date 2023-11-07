import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import config from 'config';
import app from '../app.js';
import DatabaseManager from '../db.js';
import MessageModel from '../models/message.js';
import UserModel from '../models/user.js';

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
    const user = new UserModel(
        'testUser',
        null,
        null,
        'OFFLINE',
        'UNDEFINED',
        null,
        null,
    );
    await user.persist();
    await new UserModel(
        'otherUser0',
        null,
        null,
        'OFFLINE',
        'OK',
        null,
        null,
    ).persist();
    await new UserModel(
        'otherUser1',
        null,
        null,
        'ONLINE',
        'OK',
        null,
        null,
    ).persist();
    await new UserModel(
        'otherUser2',
        null,
        null,
        'OFFLINE',
        'OK',
        null,
        null,
    ).persist();
    await new MessageModel(
        1,
        0,
        'this is a test message',
        new Date(),
        null,
        null,
    ).persist();
    passport.use('jwt', new MockStrategy({ user }));
});

describe('search routes', () => {
    test('test public message search', async () => {
        const res = await request(app)
            .get('/search')
            .query({ context: 'public', input: 'the message' });
        expect(res.statusCode).toBe(200);
        expect(res.body.messages[0].body).toBe('this is a test message');
    });
    test('test user username search', async () => {
        const res = await request(app).get('/search').query({
            context: 'citizen',
            criteria: 'username',
            input: 'other',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.users[0].username).toBe('otherUser1');
        expect(res.body.users[1].username).toBe('otherUser0');
        expect(res.body.users[2].username).toBe('otherUser2');
    });
    test('test user status search', async () => {
        const res = await request(app)
            .get('/search')
            .query({ context: 'citizen', criteria: 'status', input: 'OK' });
        expect(res.statusCode).toBe(200);
        expect(res.body.users[0].username).toBe('otherUser1');
        expect(res.body.users[1].username).toBe('otherUser0');
        expect(res.body.users[2].username).toBe('otherUser2');
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
