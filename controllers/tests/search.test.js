import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../../db.js';
import UserModel from '../../models/user.js';
import MessageModel from '../../models/message.js';
import {
    SearchContext,
    CitizenNameSearchContext,
    CitizenStatusSearchContext,
    PublicWallSearchContext,
    PrivateChatSearchContext,
} from '../search';

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
        'ONLINE',
        'OK',
        null,
        null,
    );
    await user.persist();
    passport.use('jwt', new MockStrategy({ user }));

    const publicMessage = new MessageModel(
        1,
        0,
        'test public message',
        new Date(1),
        null,
        null,
    );
    await publicMessage.persist();

    const privateMessage = new MessageModel(
        1,
        2,
        'test private message',
        new Date(1),
        null,
        null,
    );
    await privateMessage.persist();
});

describe('Test stop rule', () => {
    const searchContext = new SearchContext();
    test('no stop word', () => {
        expect(searchContext.stopRule('OK')).toBe('OK');
    });
    test('has 1 stop word', () => {
        expect(searchContext.stopRule('your OK')).toBe('OK');
    });
    test('has 2 stop words', () => {
        expect(searchContext.stopRule('your OK almost')).toBe('OK');
    });
});

describe('Test search rules for CitizenNameSearchContext', () => {
    const searchContext = new CitizenNameSearchContext();
    test('has search result', async () => {
        const result = await searchContext.search('testUser');
        const expectedResult = {
            users: [
                new UserModel(
                    'testUser',
                    null,
                    null,
                    'ONLINE',
                    'OK',
                    null,
                    null,
                ),
            ],
        };
        expect(result).toEqual(expectedResult);
    });
    test('no search result', async () => {
        const expectedResult = { users: [] };
        const result = await searchContext.search('randomUser');
        expect(result).toEqual(expectedResult);
    });
});

describe('Test search rules for CitizenStatusSearchContext', () => {
    const searchContext = new CitizenStatusSearchContext();
    test('has search result', async () => {
        const result = await searchContext.search('OK');
        const expectedResult = {
            users: [
                new UserModel(
                    'testUser',
                    null,
                    null,
                    'ONLINE',
                    'OK',
                    null,
                    null,
                ),
            ],
        };
        expect(result).toEqual(expectedResult);
    });
    test('no search result', async () => {
        const expectedResult = { users: [] };
        const result = await searchContext.search('randomStatus');
        expect(result).toEqual(expectedResult);
    });
});

describe('Test search rules for PublicWallSearchContext', () => {
    const searchContext = new PublicWallSearchContext();
    test('has search result', async () => {
        const result = await searchContext.search('public');
        const expectedResult = {
            messages: [
                {
                    body: 'test public message',
                    read_status: undefined,
                    receiver_id: undefined,
                    sender: 'testUser',
                    sender_id: undefined,
                    status: null,
                    time: new Date(1).toLocaleString(),
                },
            ],
        };
        expect(result).toEqual(expectedResult);
    });
    test('no search result', async () => {
        const expectedResult = { messages: [] };
        const result = await searchContext.search('randomMessage');
        expect(result).toEqual(expectedResult);
    });
});

describe('Test search rules for PrivateChatSearchContext', () => {
    const searchContext = new PrivateChatSearchContext();
    test('has search result', async () => {
        const result = await searchContext.search('private', 1, 2);
        const expectedResult = {
            messages: [
                {
                    body: 'test private message',
                    read_status: undefined,
                    receiver_id: undefined,
                    sender: 'testUser',
                    sender_id: undefined,
                    status: null,
                    time: new Date(1).toLocaleString(),
                },
            ],
        };
        expect(result).toEqual(expectedResult);
    });
    test('no search result', async () => {
        const expectedResult = { messages: [] };
        const result = await searchContext.search('randomMessage', 1, 2);
        expect(result).toEqual(expectedResult);
    });
    test('error when user ID not provided', async () => {
        try {
            await searchContext.search('private');
        } catch (err) {
            expect(err).toEqual(new Error('User ID not supplied!'));
        }
    });
    test('search criteria is status', async () => {});
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
