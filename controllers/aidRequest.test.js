import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import AidRequestModel from '../models/aidRequest.js';
import {
    getAllAidRequests,
    getSubmittedAidRequests,
    getAcceptedAidRequests,
    getAidRequest,
    cancelAidRequest,
    acceptAidRequest,
    resolveAidRequest,
} from './aidRequest.js';

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
        passwordHash: null,
        salt: null,
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    await user1.persist();
    passport.use('jwt', new MockStrategy({ user1 }));

    const user2 = new UserModel({
        username: 'testUser2',
        passwordHash: null,
        salt: null,
        loginStatus: 'ONLINE',
        status: 'OK',
        privilege: null,
    });
    await user2.persist();

    const req1 = new AidRequestModel({
        title: 'test',
        description: 'description',
        priority: 'Medium',
        creatorId: 1,
        acceptorId: 0,
        status: 'SUBMITTED',
    });
    await req1.persist();

    const req2 = new AidRequestModel({
        title: 'test2',
        description: 'description',
        priority: 'High',
        creatorId: 2,
        acceptorId: 1,
        status: 'ACCEPTED',
    });
    await req2.persist();
});

test('test getAllAidRequests', async () => {
    const result = await getAllAidRequests();
    const expectedResult = [
        {
            title: 'test',
            description: 'description',
            priority: 'Medium',
            creatorId: 1,
            acceptorId: 0,
            status: 'SUBMITTED',
            id: 1,
            creatorName: 'testUser',
        },
        {
            title: 'test2',
            description: 'description',
            priority: 'High',
            creatorId: 2,
            acceptorId: 1,
            status: 'ACCEPTED',
            id: 2,
            creatorName: 'testUser2',
        },
    ];
    expect(result).toEqual(expectedResult);
});

test('test getSubmittedAidRequests', async () => {
    const result = await getSubmittedAidRequests(1);

    const expectedResult = [
        {
            title: 'test',
            description: 'description',
            priority: 'Medium',
            creatorId: 1,
            acceptorId: 0,
            status: 'SUBMITTED',
            id: 1,
        },
    ];
    expect(result).toEqual(expectedResult);
});

test('test getAcceptedAidRequests', async () => {
    const result = await getAcceptedAidRequests(1);
    const expectedResult = [
        {
            title: 'test2',
            description: 'description',
            priority: 'High',
            creatorId: 2,
            acceptorId: 1,
            status: 'ACCEPTED',
            id: 2,
            creatorName: 'testUser2',
        },
    ];
    expect(result).toEqual(expectedResult);
});

test('test getAidRequest', async () => {
    const result = await getAidRequest(2);
    const expectedResult = {
        title: 'test2',
        description: 'description',
        priority: 'High',
        creatorId: 2,
        acceptorId: 1,
        status: 'ACCEPTED',
        id: 2,
        creatorName: 'testUser2',
    };
    expect(result).toEqual(expectedResult);
});

test('test acceptAidRequest', async () => {
    await acceptAidRequest(1, 2);
    const result = await getAllAidRequests();
    const expectedResult = [
        {
            title: 'test2',
            description: 'description',
            priority: 'High',
            creatorId: 2,
            acceptorId: 1,
            status: 'ACCEPTED',
            id: 2,
            creatorName: 'testUser2',
        },
        {
            title: 'test',
            description: 'description',
            priority: 'Medium',
            creatorId: 1,
            acceptorId: 2,
            status: 'ACCEPTED',
            id: 1,
            creatorName: 'testUser',
        },
    ];
    expect(result).toEqual(expectedResult);
});

test('test resolveAidRequest', async () => {
    await resolveAidRequest(1);
    const result = await getAllAidRequests();
    const expectedResult = [
        {
            title: 'test2',
            description: 'description',
            priority: 'High',
            creatorId: 2,
            acceptorId: 1,
            status: 'ACCEPTED',
            id: 2,
            creatorName: 'testUser2',
        },
    ];
    expect(result).toEqual(expectedResult);
});

test('test cancelAidRequest', async () => {
    await cancelAidRequest(2);
    const result = await getAllAidRequests();
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
