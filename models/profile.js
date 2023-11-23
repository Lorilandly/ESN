const createProfileTable = `
CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    user_id integer,
    key TEXT,
    val TEXT,
    CONSTRAINT unique_user_key_constraint UNIQUE (user_id, key)
);
`;

const getUserEntries = `
SELECT *
FROM profile
WHERE user_id = $1;
`;

const updateEntry = `
UPDATE profile
SET val = $3
WHERE user_id = $1 AND key = $2;
`;

const updateEmctEntry = `
INSERT INTO profile (user_id, key, val)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, key) DO UPDATE
SET val = $3;
`;

const addNewKey = `
INSERT INTO profile (user_id, key, val)
VALUES ($1, $2, NULL);
`;

const removeEntry = `
DELETE FROM profile
WHERE user_id = $1 AND key = $2;
`;

class ProfileModel {
    #id;
    /**
     * Create a user profile entry.
     * @param {number} id - Profile line ID.
     * @param {number} userId - Assosiated user.
     * @param {string} key - The key of the profile.
     * @param {string} val - The value for the key.
     */
    constructor(userId, key, val) {
        this.userId = userId;
        this.key = key;
        this.val = val;
    }

    static dbPoolInstance = null;

    static async initModel(dbPool) {
        ProfileModel.dbPoolInstance = dbPool;
        await ProfileModel.dbPoolInstance.query(createProfileTable);
    }

    /**
     * Get Profile entries of a user.
     * @param {number} userId User ID.
     * @returns {Array<Profile>} An array of Profile entry objects.
     */
    static async getUserProfile(userId) {
        return ProfileModel.dbPoolInstance
            .query(getUserEntries, [userId])
            .then((query) => query.rows.map(this.#queryToModel));
    }

    async updateProfileEntry() {
        // if key is special emergency one
        if (this.reservedEntry()) {
            try {
                await ProfileModel.dbPoolInstance.query('BEGIN');
                await ProfileModel.dbPoolInstance.query(updateEmctEntry, [
                    this.userId,
                    this.key,
                    this.val,
                ]);
                await ProfileModel.dbPoolInstance.query('COMMIT');
            } catch (err) {
                await ProfileModel.dbPoolInstance.query('ROLLBACK');
                throw err;
            }
        } else {
            return ProfileModel.dbPoolInstance.query(updateEntry, [
                this.userId,
                this.key,
                this.val,
            ]);
        }
        return this;
    }

    async addProfileEntry() {
        if (this.key && !this.reservedEntry()) {
            return ProfileModel.dbPoolInstance
                .query(addNewKey, [this.userId, this.key.toLowerCase()])
                .then(() => this);
        } else {
            throw new Error('Reserved profile key!');
        }
    }

    async removeProfileEntry() {
        // key cannot be special emergency one
        if (!this.reservedEntry()) {
            return ProfileModel.dbPoolInstance.query(removeEntry, [
                this.userId,
                this.key,
            ]);
        } else {
            throw new Error('Reserved profile key!');
        }
    }

    /**
     * Check if key is emergency entry.
     *
     * @returns {boolean}
     */
    reservedEntry() {
        if (this.key.startsWith('_')) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @returns {ProfileModel}
     */
    static #queryToModel(query) {
        const model = new ProfileModel(query.user_id, query.key, query.val);
        model.#id = query.id;
        return model;
    }
}

export default ProfileModel;
