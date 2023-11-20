const createFloodReportTable = `
CREATE TABLE IF NOT EXISTS floodReports (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    state TEXT NOT NULL,
    zipcode TEXT NOT NULL,
    description TEXT NOT NULL,
    time TIMESTAMP NOT NULL
);
`;

const insertFloodReport = `
INSERT INTO floodReports (address, state, zipcode, description, time)
VALUES ($1, $2, $3, $4, $5)
RETURNING id;
`;

const getAllFloodReports = `
SELECT * FROM floodReports;
`;

const getFloodReportByID = `
SELECT * FROM floodReports
WHERE id = $1;
`;

const deleteFloodReportByID = `
DELETE FROM floodReports
WHERE id = $1;
`;

class FloodReportModel {
    constructor({ address, state, zipcode, description, time }) {
        this.address = address;
        this.state = state;
        this.zipcode = zipcode;
        this.description = description;
        this.time = time;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        FloodReportModel.dbPoolInstance = dbPool;
        await FloodReportModel.dbPoolInstance.query(createFloodReportTable);
    }

    async persist() {
        const res = await FloodReportModel.dbPoolInstance.query(
            insertFloodReport,
            [
                this.address,
                this.state,
                this.zipcode,
                this.description,
                this.time,
            ],
        );
        return res.rows[0].id;
    }

    static async getAll() {
        return FloodReportModel.dbPoolInstance
            .query(getAllFloodReports)
            .then((queryResponse) => {
                queryResponse.rows.map((row) => {
                    return new FloodReportModel({
                        address: row.address,
                        state: row.state,
                        zipcode: row.zipcode,
                        description: row.description,
                        time: row.time,
                    });
                });
                return queryResponse.rows;
            });
    }

    static async findByID(floodReportID) {
        const queryResponse = await FloodReportModel.dbPoolInstance.query(
            getFloodReportByID,
            [floodReportID],
        );
        if (queryResponse.rowCount === 0) {
            return null;
        }
        const record = queryResponse.rows[0];
        return new FloodReportModel(
            record.address,
            record.state,
            record.zipcode,
            record.description,
            record.time,
        );
    }

    static async deleteByID(floodReportID) {
        await FloodReportModel.dbPoolInstance.query(deleteFloodReportByID, [
            floodReportID,
        ]);
    }
}

export default FloodReportModel;
