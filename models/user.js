import crypto from 'crypto';

let dbPoolInstance = null;

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    password_hash BYTEA,
	salt BYTEA,
    current_status TEXT,
    privilege TEXT
);
`;

const insertUser = `
INSERT INTO users (name, password_hash, salt, current_status, privilege)
VALUES ($1, $2, $3, $4, $5)
RETURNING id;
`;

const selectUserByName = `
SELECT * FROM users
WHERE name = $1;
`;

const checkUserExists = `
SELECT EXISTS(
    SELECT 1 FROM users
    WHERE name = $1
);
`;

function initUserModel(dbPool) {
	dbPoolInstance = dbPool;
	dbPoolInstance.query(createUsersTable);
}

/*
* Returns hashedPassword and salt
*/
function hash(rawPassword) {
	let salt = crypto.randomBytes(16);
	return { passwordHash: crypto.pbkdf2Sync(rawPassword, salt, 310000, 32, 'sha256'), salt }
}

function compare(rawPassword, hashedPassword, salt) {
	const newHashedPasswd =  crypto.pbkdf2Sync(rawPassword, salt, 310000, 32, 'sha256');
	return Buffer.compare(newHashedPasswd, hashedPassword) === 0;
}

/*
 * User Model - provides interface for inserting and reading users from the database.
 */
class UserModel {
	constructor() {}

	async create(name, password, privilege, currentStatus) {
		let { passwordHash, salt } = hash(password)
		const queryResponse = await dbPoolInstance.query(insertUser, [
			name,
			passwordHash,
    	  	salt,
			privilege,
			currentStatus,
		]);
		return queryResponse;
	}

	async nameExists(name) {
		const res = await db.query(checkUserExists, [name]);
		return res.rows[0].exists;
	}

	async findByName(name) {
		const queryResponse = await dbPoolInstance.query(selectUserByName, [
			name,
		]);
		return queryResponse.rows[0];
	}
	
	async checkPasswordForUser(username, password) {
		const queryResponse = await dbPoolInstance.query(selectUserByName, [
			username,
		]);
		const row = queryResponse.rows[0];
		if (!row) {
			return false;
		}
		const hashedPassword = row.password_hash;
		const salt = row.salt;
		return compare(password, hashedPassword, salt);
	}
}

const User = new UserModel();

export { initUserModel, User };
