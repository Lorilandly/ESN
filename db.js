import pg from 'pg';
import UserModel from './models/user.js';
import MessageModel from './models/message.js';

let currentDBPool = null;
let savedDBPool = null;

let testDBHost = 'localhost';
let testDBPort = 5432;

/* Connect to Postgres db and initalize a connection pool */
function createDBPool(host, port, name) {
    // console.log(`creating db pool...`
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
    currentDBPool = db;
    await UserModel.initModel(db);
    await MessageModel.initModel(db);
}

const createTestDBQuery = `CREATE DATABASE "sb2-project-performance";`;

/**
 * Creates temporary test database and connects to it.
 * The test database is set as the server's active DB connection.
 * The previous database connection is saved so that it can be restored later.
 */
async function initAndSetTestDB() {
    // expects currentDBPool is Production DB Pool
    savedDBPool = currentDBPool;
    await currentDBPool.query(createTestDBQuery);
    await initModels(
        createDBPool(testDBHost, testDBPort, 'sb2-project-performance'),
    );
}

const deleteTestDBQuery = `DROP DATABASE "sb2-project-performance";`;

/*
 * End the current connection to the test database and restore connection to the production database.
 * Init all the models using the saved database connection and delete the test database.
 */
async function deleteTestDBAndRestore() {
    // expects test db is active
    await currentDBPool.end();
    await initModels(savedDBPool);
    await currentDBPool.query(deleteTestDBQuery);
}

export { createDBPool, initAndSetTestDB, deleteTestDBAndRestore, initModels };
