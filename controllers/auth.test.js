import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import {
    reservedUsernames,
    validPassword,
    validUsername,
    validateNewCredentials,
} from './auth.js';
import { jest } from '@jest/globals';

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

    const user1 = new UserModel(
        'testuser',
        null,
        null,
        'OFFLINE',
        'OK',
        null,
        null,
    );
    await user1.persist();
    passport.use('jwt', new MockStrategy({ user1 }));
});

const mockRes = () => {
    const res = {};
    // set res.status to a jest mock function that returns res
    res.status = jest.fn().mockReturnValue(res);
    // set res.json to a jest mock function that returns res
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Test username check', () => {
    test('username valid', () => {
        expect(validUsername('lori')).toBe('lori');
    });
    test('empty username string', () => {
        expect(validUsername('')).toBe(false);
    });
    test('username too short', () => {
        expect(validUsername('lo')).toBe(false);
    });
    test('username in banned list', () => {
        // set behavior of collaborator
        reservedUsernames.add('root');
        expect(validUsername('ROOT')).toBe(false);
    });
    test('username upper cased in banned list', () => {
        // set behavior of collaborator
        reservedUsernames.add('javascript');
        expect(validUsername('Javascript')).toBe(false);
    });
    test('username upper case', () => {
        expect(validUsername('UPPER')).toBe('upper');
    });
    test('username mixed cases', () => {
        expect(validUsername('MiXeD')).toBe('mixed');
    });
});

describe('Test password check', () => {
    test('password valid', () => {
        expect(validPassword('1234')).toBe('1234');
    });
    test('password too short', () => {
        expect(validPassword('123')).toBe(false);
    });
    test('password upper case', () => {
        expect(validPassword('UPPER')).toBe('UPPER');
    });
    test('password lower case', () => {
        expect(validPassword('lower')).toBe('lower');
    });
});

// TODO: convert to integration test
describe('Test validateNewCredentials', () => {
    test('invalid username', async () => {
        const res = await validateNewCredentials(
            // mock req
            {
                body: {
                    username: 'a',
                    password: '1234',
                    dryRun: false,
                },
            },
            // mock res
            mockRes(),
            // mock next
            () => {},
        );
        expect(res.json).toHaveBeenCalledWith({ error: 'Illegal username' });
    });
    test('invalid password', async () => {
        const res = await validateNewCredentials(
            {
                body: {
                    username: 'abcd',
                    password: '12',
                    dryRun: false,
                },
            },
            mockRes(),
            () => {},
        );
        expect(res.json).toHaveBeenCalledWith({ error: 'Illegal password' });
    });
    test('dryRun set to true', async () => {
        const res = await validateNewCredentials(
            {
                body: {
                    username: 'abcd',
                    password: '1234',
                    dryRun: true,
                },
            },
            mockRes(),
            () => {},
        );
        expect(res.status).toHaveBeenCalledWith(200);
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
