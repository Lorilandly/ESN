import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import PostModel from '../models/post';
import {
    getAllUnresolvedPosts,
    getPostInfo,
    getMyPosts,
    createPost,
    resolvePost,
} from './post.js';

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
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    await user1.persist();
    passport.use('jwt', new MockStrategy({ user1 }));
    const lostAndFoundPost1 = new PostModel({
        senderId: 1,
        title: 'test title',
        body: 'test body',
        time: new Date(1),
        resolved: false,
    });
    const lostAndFoundPost2 = new PostModel({
        senderId: 1,
        title: 'test title',
        body: 'test body',
        time: new Date(1),
        resolved: true,
    });
    await lostAndFoundPost1.persist();
    await lostAndFoundPost2.persist();
});

// Positive tests

test('test getAllUnresolvedPosts', async () => {
    const posts = await getAllUnresolvedPosts();
    expect(posts.length).toBe(1);
});

test('test getPostInfo', async () => {
    const post = (await getPostInfo(1))[0];
    expect(post.sender_name).toBe('testUser');
    expect(post.title).toBe('test title');
    expect(post.body).toBe('test body');
    expect(post.time).toBe(new Date(1).toLocaleString());
});

test('test getMyPosts', async () => {
    const posts = await getMyPosts(1);
    expect(posts.length).toBe(2);
});

test('test getMyPosts no posts', async () => {
    const posts = await getMyPosts(2);
    expect(posts.length).toBe(0);
});

test('test resolvePost', async () => {
    // set req.body.postID = 1
    const req = {
        body: {
            postID: 1,
        },
        user: {
            id: 1,
        },
    };
    const res = {};
    const next = () => {};
    await resolvePost(req, res, next);
    const posts = await getAllUnresolvedPosts();
    expect(posts.length).toBe(0);
});

test('test createPost', async () => {
    const req = {
        body: {
            title: 'test title',
            message: 'test message',
        },
        user: {
            id: 1,
        },
    };
    const res = {};
    const next = () => {};
    await createPost(req, res, next);
    const posts = await getAllUnresolvedPosts();
    expect(posts.length).toBe(1);
});

// Negative tests

test('test createPost empty title', async () => {
    const req = {
        body: {
            title: '',
            message: 'test message',
        },
        user: {
            id: 1,
        },
    };
    const res = {};
    const next = () => {};
    const result = await createPost(req, res, next);
    expect(result.message).toBe('Post title or message cannot be empty');
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
