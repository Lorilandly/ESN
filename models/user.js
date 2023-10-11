import { query } from 'express';

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash BYTEA,
    salt BYTEA,
    login_status TEXT,
    status TEXT,
    status_time TIMESTAMP,
    privilege TEXT
);
`;

const insertUser = `
INSERT INTO users (username, password_hash, salt, login_status, status, status_time, privilege)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id;
`;

const selectUserByName = `
SELECT * FROM users
WHERE username = $1;
`;

const checkUserExists = `
SELECT EXISTS(
    SELECT 1 FROM users
    WHERE username = $1
);
`;

const getAllUserStatusesOrdered = `
SELECT username, login_status, status
FROM users
ORDER BY 
    CASE 
        WHEN login_status = 'ONLINE' THEN 1
        WHEN login_status = 'OFFLINE' THEN 2
        ELSE 3
    END,
    username;
`;

const changeUserLoginStatus = `
UPDATE users
SET login_status = $1
WHERE username = $2;
`;

/*
 * User Model - provides interface for inserting and reading users from the database.
 * TODO: have a Model interface
 */
class UserModel {
    constructor(username, passwordHash, salt, loginStatus, status, statusTime, privilege) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.loginStatus = loginStatus;
        this.status = status;
        this.statusTime = statusTime;
        this.privilege = privilege;
    }

    static dbPoolInstance = null;

    static initModel(dbPool) {
        this.dbPoolInstance = dbPool;
        this.dbPoolInstance.query(createUsersTable);
    }

    async persist() {
        await UserModel.dbPoolInstance.query(insertUser, [
            this.username,
            this.passwordHash,
            this.salt,
            this.loginStatus,
            this.status,
            this.statusTime,
            this.privilege,
        ]);
    }

    async nameExists(name) {
        const res = await UserModel.dbPoolInstance.query(checkUserExists, [
            name,
        ]);
        return res.rows[0].exists;
    }

    static async updateLoginStatus(name, status) {
        await this.dbPoolInstance.query(changeUserLoginStatus, [status, name]);
    }

    static async findIdByName(name) {
        const queryResponse = await this.dbPoolInstance.query(
            selectUserByName,
            [name],
        );
        if (queryResponse.rowCount == 0) {
            return null;
        } else {
            let row = queryResponse.rows[0];
            return row.id;
        }
    }

    static async findByName(name) {
        try {
            const queryResponse = await this.dbPoolInstance.query(
                selectUserByName,
                [name],
            );
            if (queryResponse.rowCount == 0) {
                return null;
            } else {
                let row = queryResponse.rows[0];
                return new UserModel(
                    row.username,
                    row.password_hash,
                    row.salt,
                    row.login_status,
                    row.status,
                    row.status_time,
                    row.privilege,
                );
            }
        } catch (err) {
            return err;
        }
    }

    static async getAllStatuses() {
        const queryResponse = await this.dbPoolInstance.query(
            getAllUserStatusesOrdered,
        );
        if (queryResponse.rowCount == 0) {
            return null;
        } else {
            return queryResponse.rows;
        }
    }
}

export default UserModel;
