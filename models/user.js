/**
 * A few suggestions:
 * TODO: Rename status -> emergency_status
 * TODO: Rename status_time -> emergency_status_last_updated
 *
 * Description of different status fields:
 * login_status -> 'ONLINE' or 'OFFLINE'
 * status -> 'UNDEFINED', 'HELP', 'OK'
 * status_time -> 'TIMESTAMP' (last time emergency_status was updated)
 * account_status -> 'ACTIVE' or 'INACTIVE' -> default is 'ACTIVE'
 * privilege -> 'ADMINISTRATOR', 'COORDINATOR', 'CITIZEN' -> default is citizen
 */
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash BYTEA,
    salt BYTEA,
    login_status TEXT,
    status TEXT,
    status_time TIMESTAMP,
    privilege TEXT,
    account_status TEXT
);
`;

const insertUser = `
INSERT INTO users (username, password_hash, salt, login_status, status, status_time, privilege, account_status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id;
`;

const selectUserByName = `
SELECT * FROM users
WHERE username = $1;
`;

const selectUserByID = `
SELECT * FROM users
WHERE id = $1;
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

const searchByNameSQL = `
SELECT *
FROM users
WHERE username ILIKE '%' || $1 || '%'
ORDER BY
  CASE login_status
    WHEN 'ONLINE' THEN 1
    WHEN 'OFFLINE' THEN 2
    ELSE 3
  END,
  username;
`;

const searchByStatusSQL = `
SELECT *
FROM users
WHERE status ILIKE '%' || $1 || '%'
ORDER BY
  CASE login_status
    WHEN 'ONLINE' THEN 1
    WHEN 'OFFLINE' THEN 2
    ELSE 3
  END,
  username;
`;

/*
 * User Model - provides interface for inserting and reading users from the database.
 */
class UserModel {
    constructor({
        username,
        passwordHash,
        salt,
        loginStatus,
        status,
        statusTime,
        privilege,
        accountStatus,
    }) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.loginStatus = loginStatus;
        this.status = status;
        this.statusTime = statusTime;
        this.privilege = privilege;
        this.accountStatus = accountStatus;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        UserModel.dbPoolInstance = dbPool;
        await UserModel.dbPoolInstance.query(createUsersTable);
    }

    async persist() {
        const res = await UserModel.dbPoolInstance.query(insertUser, [
            this.username,
            this.passwordHash,
            this.salt,
            this.loginStatus,
            this.status,
            this.statusTime,
            this.privilege,
            this.accountStatus,
        ]);
        return res.rows[0].id;
    }

    async updateStatus(status) {
        await UserModel.dbPoolInstance.query(changeUserStatus, [
            status,
            this.username,
        ]);
    }

    static async updateLoginStatus(name, status) {
        await this.dbPoolInstance.query(changeUserLoginStatus, [status, name]);
    }

    static async findByName(name) {
        return UserModel.dbPoolInstance
            .query(selectUserByName, [name])
            .then((queryResponse) => {
                if (queryResponse.rowCount === 0) {
                    return null;
                } else {
                    const row = queryResponse.rows[0];
                    const user = UserModel.queryToModel(row);
                    user.passwordHash = row.password_hash;
                    user.salt = row.salt;
                    user.id = row.id;
                    return user;
                }
            });
    }

    static async findByID(id) {
        return UserModel.dbPoolInstance
            .query(selectUserByID, [id])
            .then((queryResponse) => {
                if (queryResponse.rowCount === 0) {
                    return null;
                } else {
                    const row = queryResponse.rows[0];
                    const user = UserModel.queryToModel(row);
                    return user;
                }
            });
    }

    static async searchByName(query) {
        return UserModel.dbPoolInstance
            .query(searchByNameSQL, [query])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => UserModel.queryToModel(row)),
            );
    }

    static async searchByStatus(query) {
        return UserModel.dbPoolInstance
            .query(searchByStatusSQL, [query])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => UserModel.queryToModel(row)),
            );
    }

    static queryToModel(queryRow) {
        const params = {
            username: queryRow.username,
            passwordHash: null,
            salt: null,
            loginStatus: queryRow.login_status,
            status: queryRow.status,
            statusTime: queryRow.status_time,
            privilege: queryRow.privilege,
            accountStatus: queryRow.account_status,
        };

        return new UserModel(params);
    }

    static async getAllStatuses() {
        return UserModel.dbPoolInstance
            .query(getAllUserStatusesOrdered)
            .then((queryResponse) => {
                if (queryResponse.rowCount === 0) {
                    return null;
                } else {
                    return queryResponse.rows;
                }
            });
    }
}

export default UserModel;
