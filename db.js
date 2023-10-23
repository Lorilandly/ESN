import pg from 'pg';
import UserModel from './models/user.js';
import MessageModel from './models/message.js';

let mainDBPool = null;
let testDBPool = null;

let testDBHost = null;
let testDBPort = null;
let testDBName = null;
let testUserId = null;

function setTestDBConfgs(host, port, name) {
    testDBHost = host;
    testDBPort = port;
    testDBName = name;
}

/* Connect to Postgres db and initalize a connection pool */
function createDBPool(host, port, name) {
    let pool = new pg.Pool({
        host: host,
        port: port,
        database: name,
        user: process.env.POSTGRES_DB_USER,
        password: process.env.POSTGRES_DB_PASSWORD,
    });
    return pool;
}

/* Initialize all data models */
async function initModels(db) {
    mainDBPool = db;
    await UserModel.initModel(db);
    await MessageModel.initModel(db);
}

const createTestDBQuery = `CREATE DATABASE "sb2ProjectPerformance";`;

/**
 * Creates temporary test database and connects to it.
 * The test database is set as the server's active DB connection.
 * The previous database connection is saved so that it can be restored later.
 * TODO: explain that this creates a test user and returns the ID
 */
async function initAndSetTestDB() {
    // expects currentDBPool is Production DB Pool
    try {
        await mainDBPool.query(createTestDBQuery);
    } catch (e) {
        console.error(`failed to create test db: ${e}`);
        return;
    }
    testDBPool = createDBPool(testDBHost, testDBPort, testDBName);
    await MessageModel.initModel(testDBPool);
    await UserModel.initModel(testDBPool);

    let testUser = new UserModel('testUser', 'testPass', '', 'ONLINE', 'ADMIN');
    testUserId = await testUser.persist();

    await UserModel.initModel(mainDBPool);
    return testUserId;
}

const deleteTestDBQuery = `DROP DATABASE "sb2ProjectPerformance";`;

/*
 * End the current connection to the test database and restore connection to the production database.
 * Init all the models using the saved database connection and delete the test database.
 */
async function deleteTestDBAndRestore() {
    // expects test db is active
    if (testDBPool === null) {
        return;
    }
    await testDBPool.end();
    await initModels(mainDBPool);
    await mainDBPool.query(deleteTestDBQuery);
}

export {
    createDBPool,
    initAndSetTestDB,
    deleteTestDBAndRestore,
    initModels,
    setTestDBConfgs,
};
