const createStatusTable = `
CREATE TABLE IF NOT EXISTS status (
    id SERIAL PRIMARY KEY,
    user_id integer,
    status TEXT,
    time TIMESTAMP
);
`;

const insertStatusChange = `
INSERT INTO status (user_id, status, time)
VALUES ($1, $2, $3);
`;

const getLatestUserStatusChange = `
SELECT status, time
FROM status
WHERE user_id = $1
ORDER BY time DESC
LIMIT 10;
`;

class StatusModel {
    constructor(userId, status, time) {
        this.user_id = userId;
        this.status = status;
        this.time = time;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        StatusModel.dbPoolInstance = dbPool;
        await StatusModel.dbPoolInstance.query(createStatusTable);
    }

    async persist() {
        return StatusModel.dbPoolInstance.query(insertStatusChange, [
            this.user_id,
            this.status,
            this.time,
        ]);
    }

    static async getLatestUserStatusChange(userId) {
        return StatusModel.dbPoolInstance
            .query(getLatestUserStatusChange, [userId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            );
    }
}

export default StatusModel;
