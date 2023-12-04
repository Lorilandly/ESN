import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import LocationModel from '../models/location.js';
import { getAllLocations, getUserLocation } from './location.js';

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
        accountStatus: null,
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
    passport.use('jwt', new MockStrategy({ user2 }));

    const location1 = new LocationModel({
        sender_id: 1,
        address: '300 River Oaks Pkwy',
        city: 'San Jose',
        state: 'CA',
        latitude: 36.01225685,
        longitude: -78.95004593,
        time: new Date(1),
    });
    await location1.persist();

    const location2 = new LocationModel({
        sender_id: 2,
        address: '500 S Lasalle St',
        city: 'Durham',
        state: 'NC',
        latitude: 37.4033033,
        longitude: -121.9275474,
        time: new Date(1),
    });
    await location2.persist();
});

test('test getAllLocations', async () => {
    const result = await getAllLocations();
    const expectedResult = [
        {
            id: 1,
            sender_name: 'testUser',
            address: '300 River Oaks Pkwy',
            city: 'San Jose',
            state: 'CA',
            latitude: '36.01225685',
            longitude: '-78.95004593',
            time: new Date(1).toLocaleString(),
        },
        {
            id: 2,
            sender_name: 'testUser2',
            address: '500 S Lasalle St',
            city: 'Durham',
            state: 'NC',
            latitude: '37.40330330',
            longitude: '-121.92754740',
            time: new Date(1).toLocaleString(),
        },
    ];
    expect(result).toEqual(expectedResult);
});

test('test getUserLocation', async () => {
    const result = await getUserLocation(1);
    const expectedResult = [
        {
            id: 1,
            sender_name: 'testUser',
            address: '300 River Oaks Pkwy',
            city: 'San Jose',
            state: 'CA',
            latitude: '36.01225685',
            longitude: '-78.95004593',
            time: new Date(1).toLocaleString(),
        },
    ];
    expect(result).toEqual(expectedResult);
});

// test('test updateCurrentLocation', async () => {
//     const req = {
//         body: {
//             address: '300 River Oaks Pkwy',
//             city: 'San Jose',
//             state: 'CA',
//         },
//         user: {
//             id: 2,
//         }
//     };
//     const res = {};
//     const next = () => {};
//     await updateCurrentLocation(req, res, next);
//     const result = await getUserLocation(2);
//     const expectedResult = [
//         {
//             id: 2,
//             sender_name: 'testUser2',
//             address: '300 River Oaks Pkwy',
//             city: 'San Jose',
//             state: 'CA',
//             latitude: '36.01225685',
//             longitude: '-78.95004593',
//             time: new Date(1).toLocaleString(),
//         }
//     ];
//     expect(result).toEqual(expectedResult);
// });

// test('test shareCurrentLocation wrong coordinates', async () => {
//     const req = {
//         body: {
//             address: 'new address',
//             city: 'San Jose',
//             state: 'CA',
//         },
//         user: {
//             id: 2,
//         }
//     };
//     const res = {};
//     const next = () => {};
//     const result = await shareCurrentLocation(req, res, next);
//     expect(result.message).toBe('Address not found');
// });

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
