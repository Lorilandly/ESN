dbPoolInstance = null;

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    password_hash TEXT,
    current_status TEXT,
    privilege TEXT
);
`

const insertUser = `
INSERT INTO users (name, password_hash, current_status, privilege)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
`

function initUserModel(dbPool) {
    dbPoolInstance = dbPool;
    dbPoolInstance.query(createUsersTable);
}

class User {
    constructor(name, passwordHash, privilege, currentStatus) {
        this.name = name;
        this.passwordHash = passwordHash;
        this.privilege = privilege;
        this.currentStatus = currentStatus;
    }

    async insert() {
        const queryResponse = await dbPoolInstance.query(insertUser,
            [this.name, this.passwordHash, this.privilege, this.currentStatus],
        )
        this.id = queryResponse.id;
        return queryResponse;
    }
}

module.exports = { initUserModel, User };