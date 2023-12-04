import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import {
    atLeastOneAdmin,
    validProfileChanges,
    updateUserProfileElements,
    initIOInstanceForAdmin,
} from './profileElement.js';
import {
    initAuthController,
    requireAdminPrivileges,
    requireCoordinatorPrivileges,
    validateNewCredentials,
} from './auth.js';
import {
    create,
    getUserByName,
    getAllActiveUsers,
    getAllUsers,
} from './user.js';
import { jest } from '@jest/globals';
import MockedSocket from 'socket.io-mock';

beforeEach(async () => {
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

    initAuthController(config);

    const user1 = new UserModel({
        username: 'testuser',
        loginStatus: 'OFFLINE',
        status: 'OK',
        privilege: null,
        accountStatus: 'INACTIVE',
    });
    await user1.persist();

    const user2 = new UserModel({
        username: 'testuser2',
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
        accountStatus: 'ACTIVE',
    });
    await user2.persist();

    passport.use('jwt', new MockStrategy({ user1 }));
});

const mockRes = () => {
    const res = {};
    res.sendStatus = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

test('test At Least One Admin rule', async () => {
    const res = await atLeastOneAdmin('CITIZEN', 'ACTIVE', 1);
    expect(res).toBe(false);
});

test('test Initial Administrator rule', async () => {
    const adminCount = await UserModel.countAdmins();
    expect(adminCount).toBe(1);
});

describe('Test Privilege rule', () => {
    let res;
    let next;
    beforeEach(() => {
        res = mockRes();
        next = jest.fn();
    });

    test('admin passes admin privilege check', async () => {
        const req = {
            user: {
                username: 'abcd',
                activePrivilegeLevel: 'ADMIN',
            },
        };
        requireAdminPrivileges(req, res, next);
        expect(res.sendStatus).not.toHaveBeenCalledWith(401);
        expect(next).toHaveBeenCalled();
    });
    test('coordinator not pass admin privilege check', async () => {
        const req = {
            user: {
                username: 'abcd',
                activePrivilegeLevel: 'COORDINATOR',
            },
        };
        requireAdminPrivileges(req, res, next);
        expect(res.sendStatus).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
    test('citizen not pass admin privilege check', async () => {
        const req = {
            user: {
                username: 'abcd',
                activePrivilegeLevel: 'CITIZEN',
            },
        };
        requireAdminPrivileges(req, res, next);
        expect(res.sendStatus).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
    test('admin passes cooridinator privilege check', async () => {
        const req = {
            user: {
                username: 'abcd',
                activePrivilegeLevel: 'ADMIN',
            },
        };
        requireCoordinatorPrivileges(req, res, next);
        expect(res.sendStatus).not.toHaveBeenCalledWith(401);
        expect(next).toHaveBeenCalled();
    });
    test('coordinator passes cooridinator privilege check', async () => {
        const req = {
            user: {
                username: 'abcd',
                activePrivilegeLevel: 'COORDINATOR',
            },
        };
        requireCoordinatorPrivileges(req, res, next);
        expect(res.sendStatus).not.toHaveBeenCalledWith(401);
        expect(next).toHaveBeenCalled();
    });
    test('citizen not pass coordinator privilege check', async () => {
        const req = {
            user: {
                username: 'abcd',
                activePrivilegeLevel: 'CITIZEN',
            },
        };
        requireCoordinatorPrivileges(req, res, next);
        expect(res.sendStatus).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});

describe('Test Administrator Action of User Profile rule', () => {
    test('admin changes valid username', async () => {
        const fields = {
            username: 'testChange',
        };
        const res = async () => {
            await validProfileChanges(2, fields);
        };
        expect(res()).resolves.not.toThrow();
    });
    test('admin changes invalid username', async () => {
        const fields = {
            username: 'te',
        };
        const res = async () => {
            await validProfileChanges(2, fields);
        };
        expect(res()).rejects.toThrow('Invalid password');
    });
    test('admin changes valid password', async () => {
        const fields = {
            password: 'testChange',
        };
        const res = async () => {
            await validProfileChanges(2, fields);
        };
        expect(res()).resolves.not.toThrow();
    });
    test('admin changes invalid password', async () => {
        const fields = {
            password: 'te',
        };
        const res = async () => {
            await validProfileChanges(2, fields);
        };
        expect(res()).rejects.toThrow('Invalid password');
    });
});

describe('Test Active-Inactive rule', () => {
    let res;
    let next;
    beforeEach(() => {
        res = mockRes();
        next = jest.fn();
        initIOInstanceForAdmin(new MockedSocket());
    });

    test('active is default status', async () => {
        await create('testuser3', '1234');
        const testuser = await getUserByName('testuser3');
        expect(testuser.accountStatus).toBe('ACTIVE');
    });
    test('inactive user is logged out', async () => {
        const fields = {
            accountStatus: 'INACTIVE',
        };
        await updateUserProfileElements(2, fields);
        const user = await getUserByName('testuser');
        expect(user.loginStatus).toBe('OFFLINE');
    });
    test('inactive user cannot login', async () => {
        const req = {
            body: {
                username: 'testuser',
                password: '1234',
                dryrun: false,
            },
        };
        await validateNewCredentials(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Account is inactive' });
    });
    test('test get all active users', async () => {
        const res = await getAllActiveUsers();
        const expectedResult = [
            {
                id: 3,
                login_status: 'ONLINE',
                status: 'OK',
                username: 'testuser2',
            },
            {
                id: 1,
                login_status: 'OFFLINE',
                status: 'OK',
                username: 'esnadmin',
            },
        ];
        expect(res).toEqual(expectedResult);
    });
    test('test get all users includes inactive users', async () => {
        const res = await getAllUsers();
        const expectedResult = [
            {
                id: 1,
                login_status: 'OFFLINE',
                status: 'OK',
                username: 'esnadmin',
            },
            {
                id: 2,
                login_status: 'OFFLINE',
                status: 'OK',
                username: 'testuser',
            },
            {
                id: 3,
                login_status: 'ONLINE',
                status: 'OK',
                username: 'testuser2',
            },
        ];
        expect(res).toEqual(expectedResult);
    });
});

afterEach(async () => {
    // dismantle db
    const dbManager = DatabaseManager.getInstance();
    try {
        await dbManager.deactivateTestDB();
        await dbManager.DBPool.end();
    } catch (err) {
        console.error(err);
    }
});
