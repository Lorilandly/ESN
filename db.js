import pg from 'pg';
import UserModel from './models/user.js';
import MessageModel from './models/message.js';

let currentDBPool = null;
let testDBHost = 'localhost';
let testDBPort = 5432;


/* Connect to Postgres db and initalize a connection pool */
function createDBPool(host, port, name) {
    // console.log(`host, port, name: ${host}, ${port}, ${name}`);
    let pool = new pg.Pool({
        host: host,
        port: port,
        database: name,
        user: process.env.POSTGRES_DB_USER,
        password: process.env.POSTGRES_DB_PASSWORD,
    });
    // console.log(`pool object created: ${JSON.stringify(pool)}`);
    return pool;
}

/* Initialize all data models */
async function initModels(db) {
    currentDBPool = db;
    await UserModel.initModel(db);
    await MessageModel.initModel(db);
}

/* Return the current db pool */
function getDBPool() {
    return currentDBPool;
}


const createTestDBQuery = `CREATE DATABASE "sb2-project-performance";`;

/* Creates temporary test database on the current (or provided) database connection */
async function createTestDB(pool, name) {
    // let client = await pool.connect();
    // let res = await client.query(createTestDBQuery);
    // // let res = await client.query(`CREATE DATABASE "${name}"`);
    // console.log(`result of creating testDB: ${res}`);
    // await client.release();
    // await pool.end();
    await pool.query(createTestDBQuery);
    return createDBPool(testDBHost, testDBPort, name);
}

export { createDBPool, createTestDB, initModels, getDBPool };
