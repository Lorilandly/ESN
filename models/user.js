import { query } from 'express';

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash BYTEA,
    salt BYTEA,
    current_status TEXT,
    privilege TEXT
);
`;

const insertUser = `
INSERT INTO users (username, password_hash, salt, current_status, privilege)
VALUES ($1, $2, $3, $4, $5)
RETURNING id;
`;

const selectUserByName = `
SELECT * FROM users
WHERE username = $1;
`;

const selectUserById = `
SELECT * FROM users
WHERE id = $1;
`;

const checkUserExistsWithName = `
SELECT EXISTS(
    SELECT 1 FROM users
    WHERE username = $1
);
`;

const checkUserExistsWithId = `
SELECT EXISTS(
    SELECT 1 FROM users
    WHERE id = $1
);
`;

const getAllUserStatusesOrdered = `
SELECT id, username, current_status
FROM users
ORDER BY 
    CASE 
        WHEN current_status = 'ONLINE' THEN 1
        WHEN current_status = 'OFFLINE' THEN 2
        ELSE 3
    END,
    username;
`;

const changeUserStatus = `
UPDATE users
SET current_status = $1
WHERE username = $2;
`;

/*
 * User Model - provides interface for inserting and reading users from the database.
 * TODO: have a Model interface
 */
class UserModel {
    constructor(username, passwordHash, salt, status, privilege) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.currentStatus = status;
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
            this.status,
            this.privilege,
        ]);
    }

    static async nameExists(name) {
        const res = await UserModel.dbPoolInstance.query(
            checkUserExistsWithName,
            [name],
        );
        return res.rows[0].exists;
    }

    static async idExists(id) {
        const res = await UserModel.dbPoolInstance.query(
            checkUserExistsWithId,
            [id],
        );
        return res.rows[0].exists;
    }

    static async updateStatus(name, status) {
        await this.dbPoolInstance.query(changeUserStatus, [status, name]);
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
                    row.current_status,
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
