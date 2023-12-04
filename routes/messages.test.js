import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import config from 'config';
import app from '../app.js';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import MessageModel from '../models/message.js';

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
        passwordHash: null,
        salt: null,
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    user.id = 1;
    await user.persist();
    await new UserModel({
        username: 'otherUser0',
        passwordHash: null,
        salt: null,
        loginStatus: 'OFFLINE',
        status: 'OK',
        privilege: null,
    }).persist();
    await new MessageModel({
        senderId: 1,
        receiverId: 2,
        body: 'this is a test message',
        time: new Date(),
        status: null,
        readStatus: 'UNREAD',
    }).persist();
    passport.use('jwt', new MockStrategy({ user }));
});

describe('Chat Privately usecase tests', () => {
    test('get private message', async () => {
        const res = await request(app)
            .get('/messages/private')
            .query({ receiverId: 2 });
        expect(res.statusCode).toBe(200);
        expect(res.body.messages[0].body).toBe('this is a test message');
    });

    test('get private message with invalid receiverId', async () => {
        const res = await request(app)
            .get('/messages/private')
            .query({ receiverId: null });
        expect(res.statusCode).toBe(500);
    });

    test('post private message', async () => {
        const res = await request(app)
            .post('/messages/private')
            .send({ receiverId: 2, message: 'test message' });
        expect(res.statusCode).toBe(201);
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
