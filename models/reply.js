const createReplyTable = `
    CREATE TABLE IF NOT EXISTS replies (
        id SERIAL PRIMARY KEY,
        sender_id integer,
        post_id integer,
        reply_id integer,
        body TEXT,
        time TIMESTAMP
    );
`;

const insertReply = `
    INSERT INTO replies (sender_id, post_id, reply_id, body, time)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
`;

const getAllReplyFromPost = `
    SELECT 
    r1.id, 
    u1.username AS sender_name, 
    r1.body, 
    r1.time,
    COALESCE(u2.username, 'No replyee') AS replyee_name
    FROM replies AS r1
    JOIN users AS u1 ON r1.sender_id = u1.id
    LEFT JOIN replies AS r2 ON r1.reply_id = r2.id
    LEFT JOIN users AS u2 ON r2.sender_id = u2.id
    WHERE r1.post_id = $1
    ORDER BY r1.time ASC;
`;

class ReplyModel {
    constructor({ senderId, postId, replyId, body, time }) {
        this.senderId = senderId;
        this.postId = postId;
        this.replyId = replyId;
        this.body = body;
        this.time = time;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        ReplyModel.dbPoolInstance = dbPool;
        await ReplyModel.dbPoolInstance.query(createReplyTable);
    }

    async persist() {
        return ReplyModel.dbPoolInstance.query(insertReply, [
            this.senderId,
            this.postId,
            this.replyId,
            this.body,
            this.time,
        ]);
    }

    static async getAllReplyFromPost(postId) {
        return ReplyModel.dbPoolInstance
            .query(getAllReplyFromPost, [postId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            );
    }
}

export default ReplyModel;
