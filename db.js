// USING RAW SQL
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

// USING ORM
const { Sequelize } = require('sequelize');

async function createSequelize(name, host, port) {
    const sequelizeInstance = new Sequelize(name, process.env.POSTGRES_DB_USER, process.env.POSTGRES_DB_PASSWORD, {
        host: host,
        port: port,
        dialect: 'postgres'
    });
    
    try {
        await sequelizeInstance.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    return sequelizeInstance;
}


module.exports = { createDBPool, createSequelize };