// USING SQL
dbPoolInstance = null;

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    password_hash TEXT,
    current_status TEXT,
    privilege TEXT
);
`

const insertUser = `
INSERT INTO users (name, password_hash, current_status, privilege)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
`

function setDB(dbPool) {
    dbPoolInstance = dbPool;
}

function initializeUsersTable() {
    dbPoolInstance.query(createUsersTable);
}

class User {
    constructor(name, passwordHash, privilege, currentStatus) {
        this.name = name;
        this.passwordHash = passwordHash;
        this.privilege = privilege;
        this.currentStatus = currentStatus;
    }

    async insert() {
        const queryResponse = await dbPoolInstance.query(insertUser,
            [this.name, this.passwordHash, this.privilege, this.currentStatus],
        )
        this.id = queryResponse.id;
        return queryResponse;
    }
}

module.exports = { setDB, initializeUsersTable, User };

// USING ORM
// const { Sequelize, DataTypes } = require('sequelize');

// function createUserModel(sequelize) {
//     console.log(`${typeof(sequelize)}`);
//     const User = sequelize.define('User', {
//         // Model attributes are defined here
//         id: {
//             type: DataTypes.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//         },
//         username: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         passwordHash: {
//             type: DataTypes.STRING
//             // allowNull defaults to true
//         },
//         privilege: {
//             type: DataTypes.STRING,
            
//         },
//         currentStatus: {
//             type: DataTypes.STRING
//         }
//     });

//     // `sequelize.define` also returns the model
//     console.log(User === sequelize.models.User); // true

//     return User;
// }

// module.exports = createUserModel;