// As PRIMARY KEY starts from 1, ID 0 will not point to any user.
// For simplicity, We can reserve 0 for receiver id for public chat
const createMessagesTable = `
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id integer,
    sender_name TEXT,
    receiver_id integer,
    body TEXT,
    time TIMESTAMP,
    status TEXT
);
`;

const insertMessage = `
INSERT INTO messages (sender_id, sender_name, receiver_id, body, time, status)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;
`;

const getAllPublicMessages = `
SELECT sender_name, receiver_id, body, time, status
FROM messages
WHERE receiver_id = 0
ORDER BY time ASC;
`;

class MessagesModel {
    constructor(sender_id, sender_name, receiver_id, body, time, status) {
        this.sender_id = sender_id;
        this.sender_name = sender_name;
        this.receiver_id = receiver_id;
        this.body = body;
        this.time = time;
        this.status = status;
    }

    static dbPoolInstance = null;

    static initModel(dbPool) {
        this.dbPoolInstance = dbPool;
        this.dbPoolInstance.query(createMessagesTable);
    }

    async persist() {
        await MessageModel.dbPoolInstance.query(insertMessage, [
            this.sender_id,
            this.sender_name,
            this.receiver_id,
            this.body,
            this.time,
            this.status,
        ]);
    }

    static async getAllPublicMessages() {
        const queryResponse = await MessagesModel.dbPoolInstance.query(getAllPublicMessages);
        if (queryResponse.rowCount == 0) {
            return null;
        } else {
            return queryResponse.rows;
        }
    }

}

export default MessageModel;
