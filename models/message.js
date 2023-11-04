// As PRIMARY KEY starts from 1, ID 0 will not point to any user.
// For simplicity, We can reserve 0 for receiver id for public chat
const createMessagesTable = `
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id integer,
    receiver_id integer,
    body TEXT,
    time TIMESTAMP,
    status TEXT,
    read_status TEXT
);
`;

const insertMessage = `
INSERT INTO messages (sender_id, receiver_id, body, time, status, read_status)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;
`;

const getAllPublicMessages = `
SELECT users.username, sender_id, receiver_id, body, time, messages.status, read_status
FROM messages
JOIN users ON messages.sender_id = users.id
WHERE receiver_id = 0
ORDER BY time ASC;
`;

const getAllPrivateMessages = `
SELECT sender.username AS sender_name, receiver.username AS receiver_name, sender_id, receiver_id, body, time, messages.status, read_status
FROM messages
JOIN users AS sender ON messages.sender_id = sender.id
JOIN users AS receiver ON messages.receiver_id = receiver.id
WHERE (messages.receiver_id = $1 AND messages.sender_id = $2)
   OR (messages.receiver_id = $2 AND messages.sender_id = $1)
ORDER BY messages.time ASC;`;

const getAllNewPrivateMessages = `
SELECT users.username AS sender_name, sender_id, receiver_id, body, time, messages.status, read_status
FROM messages
JOIN users ON sender_id = users.id
WHERE receiver_id = $1 AND read_status = 'UNREAD'
ORDER BY sender_name, messages.time ASC;`;

const getLastMessageReadStatus = `
SELECT TOP 1
    read_status
FROM
    messages
WHERE
    sender_id = $1 AND receiver_id = $2
ORDER BY time DESC
`;

const changeMessageReadStatus = `
UPDATE messages
SET read_status = 'READ'
WHERE receiver_id = $1 AND read_status = 'UNREAD';
`;

const searchPublicSQL = `
SELECT * FROM messages
WHERE receiver_id = 0
AND body ILIKE '%' || $1 || '%';
`;

class MessageModel {
    constructor(senderId, receiverId, body, time, status, readStatus) {
        this.sender_id = senderId;
        this.receiver_id = receiverId;
        this.body = body;
        this.time = time;
        this.status = status;
        this.read_status = readStatus;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        MessageModel.dbPoolInstance = dbPool;
        await MessageModel.dbPoolInstance.query(createMessagesTable);
    }

    async persist() {
        await MessageModel.dbPoolInstance.query(insertMessage, [
            this.sender_id,
            this.receiver_id,
            this.body,
            this.time,
            this.status,
            this.read_status,
        ]);
    }

    static async getAllPublicMessages() {
        const queryResponse =
            await MessageModel.dbPoolInstance.query(getAllPublicMessages);
        if (queryResponse.rowCount === 0) {
            return null;
        } else {
            queryResponse.rows.forEach(
                (row) => (row.time = row.time.toLocaleString()),
            );
            return queryResponse.rows;
        }
    }

    static async getAllPrivateMessages(senderId, receiverId) {
        const queryResponse = await MessageModel.dbPoolInstance.query(
            getAllPrivateMessages,
            [senderId, receiverId],
        );
        if (queryResponse.rowCount === 0) {
            return null;
        } else {
            queryResponse.rows.forEach(
                (row) => (row.time = row.time.toLocaleString()),
            );
            return queryResponse.rows;
        }
    }

    static async getAllNewPrivateMessages(receiverId) {
        const queryResponse = await MessageModel.dbPoolInstance.query(
            getAllNewPrivateMessages,
            [receiverId],
        );
        if (queryResponse.rowCount === 0) {
            return null;
        } else {
            queryResponse.rows.forEach(
                (row) => (row.time = row.time.toLocaleString()),
            );
            return queryResponse.rows;
        }
    }

    static async getLastMessageReadStatus(senderId, receiverId) {
        const queryResponse = await MessageModel.dbPoolInstance.query(
            getLastMessageReadStatus,
            [senderId, receiverId],
        );
        if (queryResponse.rowCount === 0) {
            return null;
        } else {
            return queryResponse.rows[0].read_status;
        }
    }

    static async updatePrivateMessagesStatus(receiverId) {
        await MessageModel.dbPoolInstance.query(changeMessageReadStatus, [
            receiverId,
        ]);
    }

    static async searchPublic(query) {
        return MessageModel.dbPoolInstance
            .query(searchPublicSQL, [query])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => MessageModel.queryToModel(row)),
            );
    }

    static queryToModel(queryRow) {
        return new MessageModel(
            queryRow.sender_id,
            queryRow.receiver_id,
            queryRow.body,
            queryRow.time,
            queryRow.status,
            queryRow.read_status,
        );
    }
}

export default MessageModel;
