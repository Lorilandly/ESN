// As PRIMARY KEY starts from 1, ID 0 will not point to any user.
// For simplicity, We can reserve 0 for receiver id for public chat
const createMessagesTable = `
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id integer,
    receiver_id integer,
    body TEXT,
    time TIMESTAMP,
    status TEXT
);
`;

const insertMessage = `
INSERT INTO messages (sender_id, receiver_id, body, time, status)
VALUES ($1, $2, $3, $4, $5)
RETURNING id;
`;

const getAllPublicMessages = `
SELECT users.username, sender_id, receiver_id, body, time, status
FROM messages
JOIN users ON messages.sender_id = users.id
WHERE receiver_id = 0
ORDER BY time ASC;
`;

const getAllPrivateMessages = `
SELECT sender.username AS sender_name, receiver.username AS receiver_name, sender_id, receiver_id, body, time, status
FROM messages
JOIN users AS sender ON messages.sender_id = sender.id
JOIN users AS receiver ON messages.receiver_id = receiver.id
WHERE (messages.receiver_id = $1 AND messages.sender_id = $2)
   OR (messages.receiver_id = $2 AND messages.sender_id = $1)
ORDER BY messages.time ASC;`;

class MessageModel {
    constructor(sender_id, receiver_id, body, time, status) {
        this.sender_id = sender_id;
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
            this.receiver_id,
            this.body,
            this.time,
            this.status,
        ]);
    }

    static async getAllPublicMessages() {
        const queryResponse =
            await MessageModel.dbPoolInstance.query(getAllPublicMessages);
        if (queryResponse.rowCount == 0) {
            return null;
        } else {
            queryResponse.rows.forEach(
                (row) => (row['time'] = row['time'].toLocaleString()),
            );
            return queryResponse.rows;
        }
    }

    static async getAllPrivateMessages(senderId, receiverId) {
        const queryResponse = await MessageModel.dbPoolInstance.query(
            getAllPrivateMessages,
            [senderId, receiverId],
        );
        if (queryResponse.rowCount == 0) {
            return null;
        } else {
            queryResponse.rows.forEach(
                (row) => (row['time'] = row['time'].toLocaleString()),
            );
            return queryResponse.rows;
        }
    }
}

export default MessageModel;
