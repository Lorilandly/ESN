const createAidRequestsTable = `
CREATE TABLE IF NOT EXISTS aidRequests (
    id SERIAL PRIMARY KEY,
    creator_id integer,
    acceptor_id integer,
    title TEXT,
    description TEXT,
    priority TEXT,
    status TEXT,
);
`;

const insertAidRequest = `
INSERT INTO aidRequests (creator_id, acceptor_id, title, description, priority, status)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;
`;

const getAllAidRequests = `
SELECT id, users.username, creator_id, acceptor_id, title, description, priority, status
FROM aidRequests
JOIN users ON aidRequests.creator_id = users.id
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
SELECT id, users.username, creator_id, acceptor_id, title, description, priority, status
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
SELECT id, users.username, creator_id, acceptor_id, title, description, priority, status
FROM aidRequests
JOIN users ON aidRequests.creator_id = users.id
WHERE id = $1
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
                queryResponse.rows.map((row) =>
                    AidRequestModel.queryToModel(row),
                ),
            );
    }

    static async getSubmittedAidRequests(creatorId) {
        return AidRequestModel.dbPoolInstance
            .query(getSubmittedAidRequests, [creatorId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) =>
                    AidRequestModel.queryToModel(row),
                ),
            );
    }

    static async getAcceptedAidRequests(acceptorId) {
        return AidRequestModel.dbPoolInstance
            .query(getAcceptedAidRequests, [acceptorId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) =>
                    AidRequestModel.queryToModel(row),
                ),
            );
    }

    static async getAidRequest(aidRequestId) {
        return AidRequestModel.dbPoolInstance
            .query(getAidRequest, [aidRequestId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) =>
                    AidRequestModel.queryToModel(row),
                ),
            );
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
            .query(acceptAidRequest, [acceptorId, aidRequestId])
            .then((queryResponse) =>
                queryResponse.rows.map((row) =>
                    AidRequestModel.queryToModel(row),
                ),
            );
    }

    static async deleteAidRequest(aidRequestId) {
        return AidRequestModel.dbPoolInstance.query(deleteAidRequest, [
            aidRequestId,
        ]);
    }
}

export default AidRequestModel;
