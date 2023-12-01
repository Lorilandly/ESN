const createFloodReportTable = `
CREATE TABLE IF NOT EXISTS floodReports (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zipcode TEXT NOT NULL,
    description TEXT NOT NULL,
    time TIMESTAMP NOT NULL
);
`;

const insertFloodReport = `
INSERT INTO floodReports (address, city, state, zipcode, description, time)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;
`;

const getAllFloodReports = `
SELECT * FROM floodReports
ORDER BY floodReports.time ASC;
`;

const getFloodReportByID = `
SELECT * FROM floodReports
WHERE id = $1
ORDER BY floodReports.time ASC;
`;

const updateFloodReportByID = `
UPDATE floodReports
SET address = $2, city = $3, state = $4, zipcode = $5, description = $6
WHERE id = $1;
`;

const deleteFloodReportByID = `
DELETE FROM floodReports
WHERE id = $1;
`;

class FloodReportModel {
    /**
     * Constructs new Flood Report Model with provided object's fields.
     * @param {*} floodReportData
     */
    constructor({ address, city, state, zipcode, description, time }) {
        this.address = address;
        this.city = city;
        this.state = state;
        this.zipcode = zipcode;
        this.description = description;
        this.time = time;
    }

    static dbPoolInstance = null;

    /**
     * Initializes this model with the provided db connection.
     * @param {*} dbPool
     */
    static async initModel(dbPool) {
        FloodReportModel.dbPoolInstance = dbPool;
        await FloodReportModel.dbPoolInstance.query(createFloodReportTable);
    }

    /**
     * Saves Flood Report Model to the database.
     */
    async persist() {
        const res = await FloodReportModel.dbPoolInstance.query(
            insertFloodReport,
            [
                this.address,
                this.city,
                this.state,
                this.zipcode,
                this.description,
                this.time,
            ],
        );
        return res.rows[0].id;
    }

    /**
     * Gets all Flood Reports.
     * @returns Array of flood report data.
     */
    static async getAll() {
        return FloodReportModel.dbPoolInstance
            .query(getAllFloodReports)
            .then((queryResponse) => {
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                });
                return queryResponse.rows;
            });
    }

    /**
     * Finds flood report with provided ID.
     * @param {string} floodReportID
     * @returns Flood report model if found, else null
     */
    static async findByID(floodReportID) {
        const queryResponse = await FloodReportModel.dbPoolInstance.query(
            getFloodReportByID,
            [floodReportID],
        );
        if (queryResponse.rowCount === 0) {
            return null;
        }
        const record = queryResponse.rows[0];
        return new FloodReportModel({
            address: record.address,
            city: record.city,
            state: record.state,
            zipcode: record.zipcode,
            description: record.description,
            time: record.time.toLocaleString(),
        });
    }

    /**
     * Updates provided fields for flood report with ID.
     * @param {string} floodReportID
     * @param {*} fields
     * @returns Flood Report Data if successful, else null
     */
    static async updateByID(floodReportID, fields) {
        const floodReport = await FloodReportModel.findByID(floodReportID);
        if (floodReport === null) {
            return null;
        }
        let { address, city, state, zipcode, description } = fields;
        address = address ?? floodReport.address;
        city = city ?? floodReport.city;
        state = state ?? floodReport.state;
        zipcode = zipcode ?? floodReport.zipcode;
        description = description ?? floodReport.description;

        const queryResponse = await FloodReportModel.dbPoolInstance.query(
            updateFloodReportByID,
            [floodReportID, address, city, state, zipcode, description],
        );
        if (queryResponse.rowCount === 0) {
            return null;
        }
        const updatedReport = new FloodReportModel({
            address,
            city,
            state,
            zipcode,
            description,
        });
        updatedReport.id = floodReportID;
        return updatedReport;
    }

    /**
     * Deletes Flood Report by ID.
     * @param {string} floodReportID
     * @returns true if successful, else false
     */
    static async deleteByID(floodReportID) {
        const queryResponse = await FloodReportModel.dbPoolInstance.query(
            deleteFloodReportByID,
            [floodReportID],
        );
        return queryResponse.rowCount !== 0;
    }
}

export default FloodReportModel;
