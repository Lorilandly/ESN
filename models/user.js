dbPoolInstance = null;

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    password_hash TEXT,
    current_status TEXT,
    privilege TEXT
);
`;

const insertUser = `
INSERT INTO users (name, password_hash, current_status, privilege)
VALUES ($1, $2, $3, $4)
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
 * User Model - provides interface for inserting and reading users from the database.
 */
class UserModel {
	constructor() {}

	async create(name, passwordHash, privilege, currentStatus) {
		const queryResponse = await dbPoolInstance.query(insertUser, [
			name,
			passwordHash,
			privilege,
			currentStatus,
		]);
		// this.id = queryResponse.id;
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
		// this.id = queryResponse.id;
		return queryResponse.rows[0];
	}
}

const User = new UserModel();

module.exports = { initUserModel, User };
