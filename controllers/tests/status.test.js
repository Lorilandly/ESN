import passport from 'passport';
import MockStrategy from 'passport-mock-strategy';
import config from 'config';
import DatabaseManager from '../../db.js';
import UserModel from '../../models/user.js';
import { getUserByName } from '../user.js';
import updateUserStatus from '../status.js';

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
        'testUser',
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

test('test updateUserStatus', async () => {
    await updateUserStatus(
        {
            body: { status: 'emergency'},
            user: new UserModel(
                'testUser',
                null,
                null,
                'OFFLINE',
                'OK',
                null,
                null,
            )
        },
        null,
        () => { },
    );
    const result = await getUserByName('testUser');
    expect(result.status).toEqual('emergency');
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