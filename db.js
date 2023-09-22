import pg from 'pg';
import { initUserModel } from './models/user.js';

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
    initUserModel(db);
}

export { createDBPool, initModels };
