const createResponseTable = `
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    sender_id integer,
    location_id integer,
    message TEXT,
    time TIMESTAMP
);
`;

const insertResponse = `
    INSERT INTO responses (sender_id, location_id, message, time)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
`;

const getLocationResponse = `
SELECT responses.id, users.username AS sender_name, message, responses.time
FROM responses
JOIN users ON users.id = responses.sender_id
LEFT JOIN locations ON responses.location_id = locations.id
WHERE responses.location_id = $1
ORDER BY responses.time ASC;
`;

class ResponseModel {
    constructor({
        sender_id: senderId,
        location_id: locationId,
        message,
        time,
    }) {
        this.sender_id = senderId;
        this.location_id = locationId;
        this.message = message;
        this.time = time;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        ResponseModel.dbPoolInstance = dbPool;
        await ResponseModel.dbPoolInstance.query(createResponseTable);
    }

    async persist() {
        return ResponseModel.dbPoolInstance.query(insertResponse, [
            this.sender_id,
            this.location_id,
            this.message,
            this.time,
        ]);
    }

    static async getLocationResponse(locationId) {
        return ResponseModel.dbPoolInstance
            .query(getLocationResponse, [locationId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            );
    }
}

export default ResponseModel;
