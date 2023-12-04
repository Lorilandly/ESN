import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import MessageModel from '../models/message.js';
import {
    getAllPublicMessages,
    getAllPrivateMessages,
    getAllNewPrivateMessages,
    updatePrivateMessagesStatus,
} from './message.js';

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

    const user1 = new UserModel({
        username: 'testUser',
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    await user1.persist();
    passport.use('jwt', new MockStrategy({ user1 }));

    const user2 = new UserModel({
        username: 'testUser2',
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    await user2.persist();

    const publicMessage = new MessageModel({
        senderId: 1,
        receiverId: 0,
        body: 'test public message',
        time: new Date(1),
        status: null,
        readStatus: null,
    });
    await publicMessage.persist();

    const privateMessage = new MessageModel({
        senderId: 1,
        receiverId: 2,
        body: 'test old private message',
        time: new Date(1),
        status: null,
        readStatus: 'READ',
    });
    await privateMessage.persist();

    const privateNewMessage = new MessageModel({
        senderId: 1,
        receiverId: 2,
        body: 'test new private message',
        time: new Date(2),
        status: null,
        readStatus: 'UNREAD',
    });
    await privateNewMessage.persist();
});

test('test getAllPublicMessages', async () => {
    const result = await getAllPublicMessages();
    const expectedResult = [
        {
            body: 'test public message',
            read_status: null,
            receiver_id: 0,
            sender_id: 1,
            status: null,
            time: new Date(1).toLocaleString(),
            username: 'testUser',
        },
    ];
    expect(result).toEqual(expectedResult);
});

test('test getAllPrivateMessages', async () => {
    const result = await getAllPrivateMessages(1, 2);
    const expectedResult = [
        {
            body: 'test old private message',
            read_status: 'READ',
            receiver_id: 2,
            receiver_name: 'testUser2',
            sender_id: 1,
            sender_name: 'testUser',
            status: null,
            time: new Date(1).toLocaleString(),
        },
        {
            body: 'test new private message',
            read_status: 'UNREAD',
            receiver_id: 2,
            receiver_name: 'testUser2',
            sender_id: 1,
            sender_name: 'testUser',
            status: null,
            time: new Date(2).toLocaleString(),
        },
    ];
    expect(result).toEqual(expectedResult);
});

test('test getAllNewPrivateMessages', async () => {
    const result = await getAllNewPrivateMessages(2);
    const expectedResult = [
        {
            body: 'test new private message',
            read_status: 'UNREAD',
            receiver_id: 2,
            sender_id: 1,
            sender_name: 'testUser',
            status: null,
            time: new Date(2).toLocaleString(),
        },
    ];
    expect(result).toEqual(expectedResult);
});

test('test updatePrivateMessagesStatus', async () => {
    await updatePrivateMessagesStatus(2);
    const result = await getAllNewPrivateMessages(2);
    const expectedResult = [];
    expect(result).toEqual(expectedResult);
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
