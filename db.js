import pg from 'pg';
import UserModel from './models/user.js';
import MessageModel from './models/message.js';

class DatabaseManager {
    static instance;

    constructor(){
        if (DatabaseManager.instance){
            return DatabaseManager.instance;
        }
        this.mainDBPool = null;
        this.testDBPool = null;
        this.testDBHost = null;
        this.testDBPort = null;
        this.testDBName = null;
        this.testUserId = null;

        DatabaseManager.instance = this;
    }

    setTestDBConfigs(host, port, name) {
        this.testDBHost = host;
        this.testDBPort = port;
        this.testDBName = name;
    }

    createDBPool(host, port, name) {
        let pool = new pg.Pool({
            host: host,
            port: port,
            database: name,
            user: process.env.POSTGRES_DB_USER,
            password: process.env.POSTGRES_DB_PASSWORD,
        });
        return pool;
    }

    async initModels(db) {
        this.mainDBPool = db;
        await UserModel.initModel(db);
        await MessageModel.initModel(db);
    }

    async initAndSetTestDB() {
        // expects currentDBPool is Production DB Pool
        const createTestDBQuery = `CREATE DATABASE "sb2-project-performance";`;
        try {
            await this.mainDBPool.query(createTestDBQuery);
        } catch (e) {
            console.error(`failed to create test db: ${e}`);
            return;
        }
        this.testDBPool = this.createDBPool(this.testDBHost, this.testDBPort, this.testDBName);
        await MessageModel.initModel(this.testDBPool);
        await UserModel.initModel(this.testDBPool);

        let testUser = new UserModel('testUser', 'testPass', '', 'ONLINE', 'ADMIN');
        this.testUserId = await testUser.persist();

        await UserModel.initModel(this.mainDBPool);
        return this.testUserId;
    }

    async deleteTestDBAndRestore() {
        // expects test db is active
        if (this.testDBPool === null) {
            return;
        }
        const deleteTestDBQuery = `DROP DATABASE "sb2-project-performance";`;
        await this.testDBPool.end();
        await this.initModels(this.mainDBPool);
        await this.mainDBPool.query(deleteTestDBQuery);
    }
}

const dbManager = new DatabaseManager();
export default dbManager;

// let mainDBPool = null;
// let testDBPool = null;

// let testDBHost = null;
// let testDBPort = null;
// let testDBName = null;
// let testUserId = null;

// function setTestDBConfgs(host, port, name) {
//     testDBHost = host;
//     testDBPort = port;
//     testDBName = name;
// }

// /* Connect to Postgres db and initalize a connection pool */
// function createDBPool(host, port, name) {
//     let pool = new pg.Pool({
//         host: host,
//         port: port,
//         database: name,
//         user: process.env.POSTGRES_DB_USER,
//         password: process.env.POSTGRES_DB_PASSWORD,
//     });
//     return pool;
// }

// /* Initialize all data models */
// async function initModels(db) {
//     mainDBPool = db;
//     await UserModel.initModel(db);
//     await MessageModel.initModel(db);
// }

// const createTestDBQuery = `CREATE DATABASE "sb2-project-performance";`;

// /**
//  * Creates temporary test database and connects to it.
//  * The test database is set as the server's active DB connection.
//  * The previous database connection is saved so that it can be restored later.
//  * TODO: explain that this creates a test user and returns the ID
//  */
// async function initAndSetTestDB() {
//     // expects currentDBPool is Production DB Pool
//     try {
//         await mainDBPool.query(createTestDBQuery);
//     } catch (e) {
//         console.error(`failed to create test db: ${e}`);
//         return;
//     }
//     testDBPool = createDBPool(testDBHost, testDBPort, testDBName);
//     await MessageModel.initModel(testDBPool);
//     await UserModel.initModel(testDBPool);

//     let testUser = new UserModel('testUser', 'testPass', '', 'ONLINE', 'ADMIN');
//     testUserId = await testUser.persist();

//     await UserModel.initModel(mainDBPool);
//     return testUserId;
// }

// const deleteTestDBQuery = `DROP DATABASE "sb2-project-performance";`;

// /*
//  * End the current connection to the test database and restore connection to the production database.
//  * Init all the models using the saved database connection and delete the test database.
//  */
// async function deleteTestDBAndRestore() {
//     // expects test db is active
//     if (testDBPool === null) {
//         return;
//     }
//     await testDBPool.end();
//     await initModels(mainDBPool);
//     await mainDBPool.query(deleteTestDBQuery);
// }

// export {
//     createDBPool,
//     initAndSetTestDB,
//     deleteTestDBAndRestore,
//     initModels,
//     setTestDBConfgs,
// };
