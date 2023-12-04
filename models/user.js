import crypto from 'crypto';

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
 * privilege -> 'ADMIN', 'COORDINATOR', 'CITIZEN' -> default is citizen
 */
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash BYTEA,
    salt BYTEA,
    login_status TEXT,
    status TEXT,
    privilege TEXT,
    account_status TEXT
);
`;

const insertUser = `
INSERT INTO users (username, password_hash, salt, login_status, status, privilege, account_status)
VALUES ($1, $2, $3, $4, $5, $6, $7)
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

const getAllActiveUserStatusesOrdered = `
SELECT id, username, login_status, status
FROM users
WHERE account_status = 'ACTIVE'
ORDER BY 
    CASE 
        WHEN login_status = 'ONLINE' THEN 1
        WHEN login_status = 'OFFLINE' THEN 2
        ELSE 3
    END,
    username;
`;

const getAllUsers = `
SELECT id, username, login_status, status
FROM users;
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

const updateUserByID = `
UPDATE users
SET username = $2, password_hash = $3, salt = $4, privilege = $5, account_status = $6
WHERE id = $1;
`;

const countNumberOfAdmins = `
SELECT COUNT(*) FROM users
WHERE privilege = 'ADMIN' AND account_status = 'ACTIVE';
`;

const getUserPrivilegeByID = `
SELECT privilege FROM users
WHERE id = $1;
`;
/**
 * User Model - provides interface for inserting and reading users from the database.
 * @class
 */
class UserModel {
    #id;
    #passwordHash;
    #salt;

    /**
     * Constructs a new UserModel.
     * @constructor
     * @param {object} params - The parameters to initialize the user.
     * @param {string} params.username - The username of the user.
     * @param {string} params.loginStatus - The login status of the user.
     * @param {string} params.status - The status of the user.
     * @param {string} params.privilege - The privilege level of the user.
     */
    constructor({ username, loginStatus, status, privilege, accountStatus }) {
        this.username = username;
        this.loginStatus = loginStatus;
        this.status = status;
        this.privilege = privilege;
        this.accountStatus = accountStatus;
    }

    static dbPoolInstance = null;

    /**
     * Initializes the UserModel with a database pool.
     * @static
     * @async
     * @param {object} dbPool - The database pool instance.
     * @returns {Promise<void>}
     */
    static async initModel(dbPool) {
        UserModel.dbPoolInstance = dbPool;
        await UserModel.dbPoolInstance.query(createUsersTable);
    }

    /**
     * Sets the password for the user.
     * @method
     * @param {string} password - The password to set.
     * @returns {void}
     */
    setPassword(password) {
        this.#salt = crypto.randomBytes(16);
        this.#passwordHash = crypto.pbkdf2Sync(
            password,
            this.#salt,
            310000,
            32,
            'sha256',
        );
    }

    /**
     * Checks if the provided password matches the user's password.
     * @method
     * @param {string} password - The password to check.
     * @returns {boolean} - True if the passwords match, false otherwise.
     */
    checkPassword(password) {
        const newHashedPasswd = crypto.pbkdf2Sync(
            password,
            this.#salt,
            310000,
            32,
            'sha256',
        );
        return Buffer.compare(newHashedPasswd, this.#passwordHash) === 0;
    }

    /**
     * Persists the user data into the database.
     * @method
     * @async
     * @returns {Promise<number>} - The ID of the inserted user.
     */
    async persist() {
        const res = await UserModel.dbPoolInstance.query(insertUser, [
            this.username,
            this.#passwordHash,
            this.#salt,
            this.loginStatus,
            this.status,
            this.privilege,
            this.accountStatus,
        ]);
        return res.rows[0].id;
    }

    /**
     * Updates the user's status in the database.
     * @method
     * @async
     * @param {string} status - The new status.
     * @returns {Promise<void>}
     */
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
                    user.id = user.#id;
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
                    user.passwordHash = user.#passwordHash;
                    user.salt = user.#salt;
                    user.id = user.#id;
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

    /**
     * Retrieves all user statuses from the database.
     * @static
     * @async
     * @returns {Promise<null|Array<object>>} - The array of user statuses or null if none.
     */
    static async getAllStatuses() {
        return UserModel.dbPoolInstance
            .query(getAllActiveUserStatusesOrdered)
            .then((queryResponse) => {
                if (queryResponse.rowCount === 0) {
                    return null;
                } else {
                    return queryResponse.rows;
                }
            });
    }

    /**
     * Converts a database query result row to a UserModel instance.
     * @static
     * @param {object} queryRow - The query result row.
     * @returns {UserModel} - The UserModel instance.
     */
    static queryToModel(queryRow) {
        const user = new UserModel({
            username: queryRow.username,
            loginStatus: queryRow.login_status,
            status: queryRow.status,
            privilege: queryRow.privilege,
            accountStatus: queryRow.account_status,
        });

        user.#id = queryRow.id;
        user.#passwordHash = queryRow.password_hash;
        user.#salt = queryRow.salt;

        return user;
    }

    static async getAllUsers() {
        return UserModel.dbPoolInstance
            .query(getAllUsers)
            .then((queryResponse) => {
                if (queryResponse.rowCount === 0) {
                    return null;
                } else {
                    return queryResponse.rows;
                }
            });
    }

    async update() {
        return UserModel.dbPoolInstance.query(updateUserByID, [
            this.#id,
            this.username,
            this.#passwordHash,
            this.#salt,
            this.privilege,
            this.accountStatus,
        ]);
    }

    /**
     * Updates provided fields for user with ID.
     * @param {string} userID
     * @param {*} fields
     * @returns User Data if successful, else null
     */
    static async updateByID(userID, fields) {
        const user = await UserModel.findByID(userID);
        if (user === null) {
            return null;
        }
        const { username, password, privilegeLevel, accountStatus } = fields;

        if (password) {
            user.setPassword(password);
        }
        user.username = username ?? user.username;
        user.privilege = privilegeLevel ?? user.privilege;
        user.accountStatus = accountStatus ?? user.accountStatus;

        const queryResponse = await user.update();
        if (queryResponse.rowCount === 0) {
            return null;
        }
        user.id = userID;
        return user;
    }

    static async countAdmins() {
        const queryResponse =
            await UserModel.dbPoolInstance.query(countNumberOfAdmins);
        return parseInt(queryResponse.rows[0].count, 10);
    }

    static async getPrivilegeByID(userID) {
        const queryResponse = await UserModel.dbPoolInstance.query(
            getUserPrivilegeByID,
            [userID],
        );
        return queryResponse.rows[0].privilege;
    }
}

export default UserModel;
