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
SELECT u.username, m.body, m.time, m.status
FROM messages m
INNER JOIN users u ON m.sender_id = u.id
WHERE m.receiver_id = 0
AND ($99)
ORDER BY m.time ASC;
`;

const searchPrivateSQL = `
SELECT u.username, m.body, m.time, m.status
FROM messages m
INNER JOIN users u ON m.sender_id = u.id
WHERE ((m.receiver_id = $2 AND m.sender_id = $1)
   OR (m.receiver_id = $1 AND m.sender_id = $2))
AND ($99)
ORDER BY m.time ASC;
`;

class MessageModel {
    constructor({ senderId, receiverId, body, time, status, readStatus }) {
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
        return MessageModel.dbPoolInstance.query(insertMessage, [
            this.sender_id,
            this.receiver_id,
            this.body,
            this.time,
            this.status,
            this.read_status,
        ]);
    }

    static async getAllPublicMessages() {
        return MessageModel.dbPoolInstance
            .query(getAllPublicMessages)
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            );
    }

    static async getAllPrivateMessages(senderId, receiverId) {
        return MessageModel.dbPoolInstance
            .query(getAllPrivateMessages, [senderId, receiverId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            );
    }

    static async getAllNewPrivateMessages(receiverId) {
        return MessageModel.dbPoolInstance
            .query(getAllNewPrivateMessages, [receiverId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            );
    }

    static async getLastMessageReadStatus(senderId, receiverId) {
        return MessageModel.dbPoolInstance
            .query(getLastMessageReadStatus, [senderId, receiverId])
            .then((queryResponse) => {
                if (queryResponse.rowCount === 0) {
                    return null;
                } else {
                    return queryResponse.rows[0].read_status;
                }
            });
    }

    static async updatePrivateMessagesStatus(receiverId) {
        return MessageModel.dbPoolInstance.query(changeMessageReadStatus, [
            receiverId,
        ]);
    }

    static async searchPublic(query) {
        const terms = query.split(' ');
        const whereClauses = terms
            .map((term) => `m.body ILIKE '%${term}%'`)
            .join(' AND ');
        const sqlQuery = searchPublicSQL.replace('$99', whereClauses);
        return MessageModel.dbPoolInstance
            .query(sqlQuery)
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    const obj = MessageModel.queryToModel(row);
                    obj.sender = row.username;
                    return obj;
                }),
            );
    }

    static async searchPrivate(query, userId0, userId1) {
        if (!(userId0 && userId1)) {
            throw new Error('User ID not supplied!');
        }
        const terms = query.split(' ');
        const whereClauses = terms
            .map((term) => `m.body ILIKE '%${term}%'`)
            .join(' AND ');
        const sqlQuery = searchPrivateSQL.replace('$99', whereClauses);
        return MessageModel.dbPoolInstance
            .query(sqlQuery, [userId0, userId1])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    const obj = MessageModel.queryToModel(row);
                    obj.sender = row.username;
                    return obj;
                }),
            );
    }

    static queryToModel(queryRow) {
        return new MessageModel({
            senderId: queryRow.sender_id,
            receiverId: queryRow.receiver_id,
            body: queryRow.body,
            time: queryRow.time.toLocaleString(),
            status: queryRow.status,
            readStatus: queryRow.read_status,
        });
    }
}

export default MessageModel;
