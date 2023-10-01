const createMessagesTable = `
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    body TEXT,
    time TIMESTAMP
);
`;

const insertMessage = `
INSERT INTO messages (user_id, body, time)
VALUES ($1, $2, $3)
RETURNING id;
`;

class MessagesModel {
    constructor(userId, body, time) {
        this.userId = userId
        this.body = body;
        this.time = time;
    }

    static dbPoolInstance = null;

    static initModel(dbPool) {
        this.dbPoolInstance = dbPool;
        this.dbPoolInstance.query(createMessagesTable);
    }

    async persist() {
        await MessagesModel.dbPoolInstance.query(insertMessage, [
            this.userId,
            this.body,
            this.time,
        ])
    }
}

export default MessagesModel;
