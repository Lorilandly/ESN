const createLocationTable = `
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    sender_id integer,
    address TEXT,
    city TEXT,
    state TEXT,
    time TIMESTAMP
);
`;

const insertLocation = `
    INSERT INTO locations (sender_id, address, city, state, time)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
`;

const getAllLocations = `
SELECT locations.id, users.username AS sender_name, address, city, state, time
FROM locations
JOIN users ON users.id = locations.sender_id
ORDER BY locations.time ASC;
`;

const updateUserLocation = `
UPDATE locations
SET address = $2, city = $3, state = $4, time = $5
WHERE id = $1;
`;

const deleteUserLocation = `
DELETE FROM locations
WHERE sender_id = $1;
`;

class LocationModel {
    constructor({ sender_id, address, city, state, time }) {
        this.sender_id = sender_id;
        this.address = address;
        this.city = city;
        this.state = state;
        this.time = time;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        LocationModel.dbPoolInstance = dbPool;
        await LocationModel.dbPoolInstance.query(createLocationTable);
    }

    async persist() {
        return LocationModel.dbPoolInstance.query(insertLocation, [
            this.sender_id,
            this.address,
            this.city,
            this.state,
            this.time,
        ]);
    }

    static async getAllLocations() {
        return LocationModel.dbPoolInstance
            .query(getAllLocations)
            .then((queryResponse) =>
                queryResponse.rows.map((row) => {
                    row.time = row.time.toLocaleString();
                    return row;
                }),
            );
    }

    static async updateUserLocation(sender_id, address, city, state, time) {
        try {
            return LocationModel.dbPoolInstance.query(updateUserLocation, [
                sender_id,
                address,
                city,
                state,
                time,
            ]);
        } catch (error) {
            console.error('Error updating user location:', error);
            throw error;
        }
    }

    static async deleteUserLocation(sender_id) {
        const result = await LocationModel.dbPoolInstance.query(
            deleteUserLocation,
            [sender_id],
        );
        return result.rowCount;
    }
}

export default LocationModel;
