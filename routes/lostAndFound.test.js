import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import request from 'supertest';
import config from 'config';
import app from '../app.js';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import PostModel from '../models/post';
import ReplyModel from '../models/reply.js';

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
    const user = new UserModel({
        username: 'testUser',
        passwordHash: null,
        salt: null,
        loginStatus: 'ONLINE',
        status: 'OK',
        statusTime: null,
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
        statusTime: null,
        privilege: null,
    }).persist();
    await new PostModel({
        senderId: 1,
        title: 'test title',
        body: 'test body',
        time: new Date(1),
        resolved: false,
    }).persist();
    passport.use('jwt', new MockStrategy({ user }));
})

describe("Lost and found usecase tests", () => {
    // Positive tests
    test('get all unresolved posts', async () => {
        const res = await request(app)
            .get('/lostAndFounds/unresolved');
        expect(res.statusCode).toBe(200);
        expect(res.body.posts.length).toBe(1);
        expect(res.body.posts[0].title).toBe("test title");
    });

    test('create a post', async () => {
        const res = await request(app)
            .post('/lostAndFounds/')
            .send({
                title: 'test title',
                message: 'test body',
            });
        expect(res.statusCode).toBe(201);
    });

    test('create a reply to post', async() => {
        const res = await request(app)
            .post("/lostAndFounds/posts/1/response")
            .send({
                body: "test reply",
                postID : 1,
                replyID : 0,
            });
        expect(res.statusCode).toBe(201);
    });

    test('retrieve post info', async() => {
        const res = await request(app)
            .get("/lostAndFounds/posts/1/info");
        expect(res.statusCode).toBe(200);
        expect(res.body.post[0].title).toBe("test title");
        expect(res.body.post[0].body).toBe("test body");
        expect(res.body.post[0].sender_name).toBe("testUser");
        expect(res.body.replies[0].body).toBe("test reply");
        expect(res.body.replies[0].replyee_name).toBe("No replyee");
    });

    test('resolve a post', async() => {
        const res = await request(app)
            .post("/lostAndFounds/myPosts/status")
            .send({
                postID : 1,
            });
        expect(res.statusCode).toBe(201);
    });

    // Negative tests
    test('get posts info with invalid postID', async () => {
        const res = await request(app)
            .get('/lostAndFounds/posts/0/info')
        expect(res.statusCode).toBe(500);
    });
    test('get post page with invalid postID', async () => {
        const res = await request(app)
            .get('/lostAndFounds/posts/0')
        expect(res.statusCode).toBe(500);
    });
    test('reply to a post with invalid postID', async() => {
        const res = await request(app)
            .post("/lostAndFounds/posts/0/response")
            .send({
                body: "test reply",
                postID : 0,
                replyID : 0,
            });
        expect(res.statusCode).toBe(500);
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
