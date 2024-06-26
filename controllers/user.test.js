import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import { create, getAllActiveUsers, getUserByName } from './user.js';

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
        loginStatus: 'OFFLINE',
        status: 'OK',
        privilege: null,
        accountStatus: 'ACTIVE',
    });
    await user1.persist();

    passport.use('jwt', new MockStrategy({ user1 }));

    const user2 = new UserModel({
        username: 'testUser2',
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
        accountStatus: 'ACTIVE',
    });
    await user2.persist();
});

test('test getAllActiveUsers', async () => {
    const result = await getAllActiveUsers();
    const expectedResult = [
        {
            id: 2,
            login_status: 'ONLINE',
            status: 'OK',
            username: 'testUser2',
        },
        { id: 1, login_status: 'OFFLINE', status: 'OK', username: 'testUser' },
    ];
    expect(result).toEqual(expectedResult);
});

test('test getUserByName', async () => {
    const result = await getUserByName('testUser');
    const expectedResult = {
        id: 1,
        accountStatus: 'ACTIVE',
        loginStatus: 'OFFLINE',
        privilege: null,
        status: 'OK',
        username: 'testUser',
    };
    expect(result).toEqual(expectedResult);
});

test('test create', async () => {
    await create('normalUser', '1234');
    const result = await getUserByName('normaluser');
    expect(result.username).toEqual('normaluser');
    expect(result.loginStatus).toEqual('OFFLINE');
    expect(result.privilege).toEqual('CITIZEN');
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
