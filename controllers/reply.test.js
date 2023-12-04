import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import PostModel from '../models/post';
import ReplyModel from '../models/reply.js';
import { getAllReplyFromPost, createReply } from './reply.js';

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

    const user1 = new UserModel({
        username: 'testUser',
        passwordHash: null,
        salt: null,
        loginStatus: 'ONLINE',
        status: 'OK',
        statusTime: null,
        privilege: null,
    });

    const user2 = new UserModel({
        username: 'testUser2',
        passwordHash: null,
        salt: null,
        loginStatus: 'ONLINE',
        status: 'OK',
        statusTime: null,
        privilege: null,
    });

    await user1.persist();
    await user2.persist();
    passport.use('jwt', new MockStrategy({ user1 }));

    const post1 = new PostModel({
        senderId: 1,
        title: 'test title',
        body: 'test body',
        time: new Date(1),
        resolved: false,
    });

    await post1.persist();

    const reply1 = new ReplyModel({
        senderId: 1,
        postId: 1,
        body: 'test body',
        time: new Date(1),
    });

    const reply2 = new ReplyModel({
        senderId: 2,
        postId: 1,
        replyId: 1,
        body: 'test body',
        time: new Date(1),
    });

    await reply1.persist();
    await reply2.persist();
});

// Positive tests

test('test getAllReplyFromPost', async () => {
    const reply = await getAllReplyFromPost(1);
    expect(reply.length).toBe(2);
    expect(reply[0].sender_name).toBe('testUser2');
    expect(reply[0].body).toBe('test body');
    expect(reply[0].time).toBe(new Date(1).toLocaleString());
    expect(reply[0].replyee_name).toBe('testUser');
    expect(reply[1].sender_name).toBe('testUser');
    expect(reply[1].body).toBe('test body');
    expect(reply[1].time).toBe(new Date(1).toLocaleString());
    expect(reply[1].replyee_name).toBe('No replyee');
});

test('test createReply', async () => {
    const req = {
        user: {
            id: 1,
        },
        body: {
            postID: 1,
            body: 'test body',
            replyID: null,
        },
    };
    const res = {};
    const next = () => {};
    await createReply(req, res, next);
    const reply = await getAllReplyFromPost(1);
    expect(reply.length).toBe(3);
});

// Negative tests

test('test createReply with no message', async () => {
    const req = {
        user: {
            id: 1,
        },
        body: {
            postID: 1,
            body: '',
            replyID: null,
        },
    };
    const res = {};
    const next = () => {};
    const result = await createReply(req, res, next);
    expect(result.message).toBe('Reply body cannot be empty');
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
