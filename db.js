// USING RAW SQL
// const Pool = require('pg').Pool;

// function createDBPool(host, port, name) {
//     pool = new Pool({
//         host: host,
//         port: port,
//         database: name,
//         user: process.env.POSTGRES_DB_USER,
//         password: process.env.POSTGRES_DB_PASSWORD,
//     });

//     return pool;
// }

// USING ORM
const { Sequelize } = require('sequelize');

function connectToPostgres(name, host, port) {
    const sequelize = new Sequelize(name, process.env.POSTGRES_DB_USER, process.env.POSTGRES_DB_PASSWORD, {
        host: host,
        port: port,
        dialect: 'postgres'
    });

    sequelize.authenticate().then(() => {
        console.log('Connection has been established successfully.');
    }).catch((error) => {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    });
    
    return sequelize;

}


module.exports = { /*createDBPool,*/ connectToPostgres};