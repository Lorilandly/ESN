const createPostTable = `
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        sender_id integer,
        title varchar(255),
        body TEXT,
        time TIMESTAMP,
        resolved BOOLEAN
    );
`;

const insertPost = `
    INSERT INTO posts (sender_id, title, body, time, resolved)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
`;

const getAllUnresolvedPosts = `
    SELECT posts.id, users.username AS sender_name, title, time
    FROM posts
    JOIN users ON posts.sender_id = users.id
    WHERE resolved = false
    ORDER BY time ASC;
`;

const getPostInfo = `
    SELECT posts.id, users.username AS sender_name, title, body, time
    FROM posts
    JOIN users ON posts.sender_id = users.id
    WHERE posts.id = $1
`;

const getMyPosts = `
    SELECT posts.id, users.username AS sender_name, title, time, resolved
    FROM posts
    JOIN users ON posts.sender_id = users.id
    WHERE posts.sender_id = $1
    ORDER BY resolved ASC, time ASC;
`;

const resolvePost = `
    UPDATE posts
    SET resolved = true
    WHERE id = $1;
`;

class PostModel {
    constructor({ senderId, title, body, time, resolved }) {
        this.senderId = senderId;
        this.title = title;
        this.body = body;
        this.time = time;
        this.resolved = resolved;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        PostModel.dbPoolInstance = dbPool;
        await PostModel.dbPoolInstance.query(createPostTable);
    }

    async persist() {
        return PostModel.dbPoolInstance.query(insertPost, [
            this.senderId,
            this.title,
            this.body,
            this.time,
            this.resolved,
        ]);
    }

    static async getAllUnresolvedPosts() {
        return PostModel.dbPoolInstance
            .query(getAllUnresolvedPosts)
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            )
            .catch((err) => {
                // Handle or log the error
                console.error('Error executing query:', err);
                throw err; // or handle it as needed
            });
    }

    static async getPostInfo(postId) {
        return PostModel.dbPoolInstance
            .query(getPostInfo, [postId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            );
    }

    static async getMyPosts(userId) {
        return PostModel.dbPoolInstance
            .query(getMyPosts, [userId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            );
    }

    static async resolvePost(postId) {
        return PostModel.dbPoolInstance.query(resolvePost, [postId]);
    }
}

export default PostModel;
