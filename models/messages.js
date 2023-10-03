// As PRIMARY KEY starts from 1, ID 0 will not point to any user.
// For simplicity, We can reserve 0 for receiver id for public chat
const createMessagesTable = `
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id integer,
    receiver_id integer,
    body TEXT,
    time TIMESTAMP
);
`;

const insertMessage = `
INSERT INTO messages (sender_id, receiver_id, body, time)
VALUES ($1, $2, $3, $4)
RETURNING id;
`;

class MessagesModel {
    constructor(sender_id, receiver_id, body, time) {
        this.sender_id = sender_id;
        this.receiver_id = receiver_id;
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
            this.sender_id,
            this.receiver_id,
            this.body,
            this.time,
        ]);
    }
}

export default MessagesModel;
