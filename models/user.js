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
SELECT id, username, login_status, status
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

const changeUserStatus = `
UPDATE users
SET status = $1
WHERE username = $2;
`;

/*
 * User Model - provides interface for inserting and reading users from the database.
 * TODO: have a Model interface
 */
class UserModel {
    constructor (
        username,
        passwordHash,
        salt,
        loginStatus,
        status,
        statusTime,
        privilege,
    ) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.loginStatus = loginStatus;
        this.status = status;
        this.statusTime = statusTime;
        this.privilege = privilege;
    }

    static dbPoolInstance = null;

    static async initModel (dbPool) {
        UserModel.dbPoolInstance = dbPool;
        await UserModel.dbPoolInstance.query(createUsersTable);
    }

    async persist () {
        const res = await UserModel.dbPoolInstance.query(insertUser, [
            this.username,
            this.passwordHash,
            this.salt,
            this.loginStatus,
            this.status,
            this.statusTime,
            this.privilege,
        ]);
        return res.rows[0].id;
    }

    static async nameExists (name) {
        const res = await UserModel.dbPoolInstance.query(
            checkUserExistsWithName,
            [name],
        );
        return res.rows[0].exists;
    }

    static async idExists (id) {
        const res = await UserModel.dbPoolInstance.query(
            checkUserExistsWithId,
            [id],
        );
        return res.rows[0].exists;
    }

    async updateStatus (status) {
        await UserModel.dbPoolInstance.query(changeUserStatus, [
            status,
            this.username,
        ]);
    }

    static async updateLoginStatus (name, status) {
        await this.dbPoolInstance.query(changeUserLoginStatus, [status, name]);
    }

    static async findIdByName (name) {
        const queryResponse = await UserModel.dbPoolInstance.query(
            selectUserByName,
            [name],
        );
        if (queryResponse.rowCount === 0) {
            return null;
        } else {
            const row = queryResponse.rows[0];
            return row.id;
        }
    }

    static async findByName (name) {
        try {
            const queryResponse = await UserModel.dbPoolInstance.query(
                selectUserByName,
                [name],
            );
            if (queryResponse.rowCount === 0) {
                return null;
            } else {
                const row = queryResponse.rows[0];
                const user = new UserModel(
                    row.username,
                    row.password_hash,
                    row.salt,
                    row.login_status,
                    row.status,
                    row.status_time,
                    row.privilege,
                );
                user.id = row.id;
                return user;
            }
        } catch (err) {
            return err;
        }
    }

    static async getAllStatuses () {
        const queryResponse = await UserModel.dbPoolInstance.query(
            getAllUserStatusesOrdered,
        );
        if (queryResponse.rowCount === 0) {
            return null;
        } else {
            return queryResponse.rows;
        }
    }
}

export default UserModel;
