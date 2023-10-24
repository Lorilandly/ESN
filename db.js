import pg from 'pg';
import UserModel from './models/user.js';
import MessageModel from './models/message.js';

class DatabaseManager {
    static instance;

    constructor() {
        this.activeDB = null;

        this.DBPool = null;
        this.DBHost = null;
        this.DBPort = null;
        this.DBName = null;

        this.testDBPool = null;
        this.testDBHost = null;
        this.testDBPort = null;
        this.testDBName = null;
    }

    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    static async initModels(db) {
        await UserModel.initModel(db);
        await MessageModel.initModel(db);
    }

    static createDBPool(host, port, name) {
        let pool = new pg.Pool({
            host: host,
            port: port,
            database: name,
            user: process.env.POSTGRES_DB_USER,
            password: process.env.POSTGRES_DB_PASSWORD,
        });
        return pool;
    }

    configureDB(host, port, name) {
        this.DBHost = host;
        this.DBPort = port;
        this.DBName = name;
        this.DBPool = DatabaseManager.createDBPool(
            this.DBHost,
            this.DBPort,
            this.DBName,
        );
    }

    configureTestDB(host, port, name) {
        this.testDBHost = host;
        this.testDBPort = port;
        this.testDBName = name;
    }

    async activateDB() {
        if (this.activeDB === 'main') {
            return;
        }
        this.activeDB = 'main';
        await DatabaseManager.initModels(this.DBPool);
    }

    async activateTestDB() {
        // expects currentDBPool is not test DB Pool
        if (this.activeDB === 'test') {
            return;
        }
        this.activeDB = 'test';
        const createTestDBQuery = `CREATE DATABASE "${this.testDBName}";`;
        try {
            await this.DBPool.query(createTestDBQuery);
        } catch (e) {
            // DB already created. We'll let this fall through.
            console.error(`failed to create test db: ${e}`);
        }
        this.testDBPool = DatabaseManager.createDBPool(
            this.testDBHost,
            this.testDBPort,
            this.testDBName,
        );

        await DatabaseManager.initModels(this.testDBPool);

        let testUser = new UserModel(
            'testUser',
            'hash',
            'salt',
            'ONLINE',
            'UNDEFINED',
        );
        let testUserId = await testUser.persist();

        await UserModel.initModel(this.DBPool);
        return testUserId;
    }

    async deactivateTestDB() {
        // expects test db is active
        if (this.activeDB !== 'test') {
            return;
        }
        const deleteTestDBQuery = `DROP DATABASE "${this.testDBName}";`;
        await this.testDBPool.end();
        await this.activateDB();
        await this.DBPool.query(deleteTestDBQuery);
    }
}

export default DatabaseManager;
