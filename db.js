const Pool = require('pg').Pool;

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

module.exports = createDBPool;