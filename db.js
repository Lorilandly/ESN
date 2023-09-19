const Pool = require('pg').Pool;
const initUserModel = require('./models/user').initUserModel;

/* Connect to Postgres db and initalize a connection pool */
function createDBPool(host, port, name) {
    pool = new Pool({
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

module.exports = { createDBPool, initModels }