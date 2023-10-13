import pg from 'pg';
import UserModel from './models/user.js';
import MessageModel from './models/message.js';

let currentDBPool = null;

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
function initModels(db) {
    currentDBPool = db;
    UserModel.initModel(db);
    MessageModel.initModel(db);
}

/* Return the current db pool */
function getDBPool() {
    return currentDBPool;
}

export { createDBPool, initModels, getDBPool };
