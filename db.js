import pg from 'pg';
import UserModel from './models/user.js';
import MessageModel from './models/message.js';

class DatabaseManager {
    static instance;

    constructor() {
        this.mainDBPool = null;
        this.mainDBPort = null;
        this.mainDBName = null;

        this.testDBPool = null;
        this.testDBHost = null;
        this.testDBPort = null;
        this.testDBName = null;
        this.testUserId = null;
    }

    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    setMainDBConfigs(host, port, name) {
        this.mainDBPool = host;
        this.mainDBPort = port;
        this.mainDBName = name;
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
        await UserModel.initModel(db);
        await MessageModel.initModel(db);
    }

    async initAndSetMainDB() {
        this.mainDBPool = this.createDBPool(
            this.mainDBHost,
            this.mainDBPort,
            this.mainDBName,
        );
        await this.initModels(this.mainDBPool);
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
        this.testDBPool = this.createDBPool(
            this.testDBHost,
            this.testDBPort,
            this.testDBName,
        );

        await this.initModels(this.testDBPool);

        let testUser = new UserModel(
            'testUser',
            'testPass',
            '',
            'ONLINE',
            'ADMIN',
        );
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

export default DatabaseManager;
