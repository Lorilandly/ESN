const createAidRequestsTable = `
CREATE TABLE IF NOT EXISTS aidRequests (
    id SERIAL PRIMARY KEY,
    creator_id integer,
    acceptor_id integer,
    title TEXT,
    description TEXT,
    priority TEXT,
    status TEXT
);
`;

const insertAidRequest = `
INSERT INTO aidRequests (title, description, priority, creator_id, acceptor_id, status)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;
`;

const getAllAidRequests = `
SELECT aidRequests.id, users.username, creator_id, acceptor_id, title, description, priority, aidRequests.status
FROM aidRequests
JOIN users ON aidRequests.creator_id = users.id
ORDER BY 
    CASE aidRequests.status
        WHEN 'submitted' then 1
        WHEN 'accepted' then 2
    END,
    CASE priority
        WHEN 'high' then 1
        WHEN 'medium' then 2
        WHEN 'low' then 3
    END;
`;

const getSubmittedAidRequests = `
SELECT * FROM aidRequests
WHERE creator_id = $1
ORDER BY 
    CASE status
        WHEN 'submitted' then 1
        WHEN 'accepted' then 2
    END,
    CASE priority
        WHEN 'high' then 1
        WHEN 'medium' then 2
        WHEN 'low' then 3
    END;
`;

const getAcceptedAidRequests = `
SELECT aidRequests.id, users.username, creator_id, acceptor_id, title, description, priority, aidRequests.status
FROM aidRequests
JOIN users ON aidRequests.creator_id = users.id
WHERE acceptor_id = $1
ORDER BY 
    CASE priority
        WHEN 'high' then 1
        WHEN 'medium' then 2
        WHEN 'low' then 3
    END;
`;

const getAidRequest = `
SELECT aidRequests.id, users.username, creator_id, acceptor_id, title, description, priority, aidRequests.status
FROM aidRequests
JOIN users ON aidRequests.creator_id = users.id
WHERE aidRequests.id = $1
ORDER BY 
    CASE priority
        WHEN 'high' then 1
        WHEN 'medium' then 2
        WHEN 'low' then 3
    END;
`;

const updateAidRequest = `
UPDATE aidRequests
SET title = $1, description = $2, priority = $3
WHERE id = $4
`;

const acceptAidRequest = `
UPDATE aidRequests
SET status = 'ACCEPTED', acceptor_id = $1
WHERE id = $2
`;

const deleteAidRequest = `
DELELE FROM aidRequests
WHERE id = $1;
`;

class AidRequestModel {
    constructor({
        title,
        description,
        priority,
        creatorId,
        acceptorId,
        status,
    }) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.creatorId = creatorId;
        this.acceptorId = acceptorId;
        this.status = status;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        AidRequestModel.dbPoolInstance = dbPool;
        await AidRequestModel.dbPoolInstance.query(createAidRequestsTable);
    }

    async persist() {
        return AidRequestModel.dbPoolInstance.query(insertAidRequest, [
            this.title,
            this.description,
            this.priority,
            this.creatorId,
            this.acceptorId,
            this.status,
        ]);
    }

    static queryToModel(queryRow) {
        const params = {
            title: queryRow.title,
            description: queryRow.description,
            priority: queryRow.priority,
            creatorId: queryRow.creatorId,
            acceptorId: queryRow.acceptorId,
            status: queryRow.status,
        };

        return new AidRequestModel(params);
    }

    static async getAllAidRequests() {
        return AidRequestModel.dbPoolInstance
            .query(getAllAidRequests)
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    const obj = AidRequestModel.queryToModel(row);
                    obj.creatorName = row.username;
                    obj.id = row.id;
                    return obj;
                }),
            );
    }

    static async getSubmittedAidRequests(creatorId) {
        return AidRequestModel.dbPoolInstance
            .query(getSubmittedAidRequests, [creatorId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    const obj = AidRequestModel.queryToModel(row);
                    obj.id = row.id;
                    return obj;
                }),
            );
    }

    static async getAcceptedAidRequests(acceptorId) {
        return AidRequestModel.dbPoolInstance
            .query(getAcceptedAidRequests, [acceptorId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    const obj = AidRequestModel.queryToModel(row);
                    obj.creatorName = row.username;
                    obj.id = row.id;
                    return obj;
                }),
            );
    }

    static async getAidRequest(aidRequestId) {
        return AidRequestModel.dbPoolInstance
            .query(getAidRequest, [aidRequestId])
            .then((queryResponse) => {
                if (queryResponse.rowCount === 0) {
                    return null;
                } else {
                    const row = queryResponse.rows[0];
                    const aidRequest = AidRequestModel.queryToModel(row);
                    aidRequest.creatorName = row.username;
                    aidRequest.id = row.id;
                    return aidRequest;
                }
            });
    }

    static async updateAidRequest(title, description, priority, aidRequestId) {
        return AidRequestModel.dbPoolInstance
            .query(updateAidRequest, [
                title,
                description,
                priority,
                aidRequestId,
            ])
            .then((queryResponse) =>
                queryResponse.rows.map((row) =>
                    AidRequestModel.queryToModel(row),
                ),
            );
    }

    static async acceptAidRequest(aidRequestId, acceptorId) {
        return AidRequestModel.dbPoolInstance
            .query(acceptAidRequest, [acceptorId, aidRequestId]);
    }

    static async deleteAidRequest(aidRequestId) {
        return AidRequestModel.dbPoolInstance.query(deleteAidRequest, [
            aidRequestId,
        ]);
    }
}

export default AidRequestModel;
