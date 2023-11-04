import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';

let testModeActive = false;
let testAdminUsername = null;

async function startPerformanceTestMode(req, res) {
    const dbManager = DatabaseManager.getInstance();
    testAdminUsername = req.user.username;
    const testAdminUser = await UserModel.findByName(testAdminUsername);

    await dbManager.activateTestDB();
    // save admin user to test db
    await testAdminUser.persist();

    testModeActive = true;
    res.status(201).json({ message: 'test mode active' });
}

async function endPerformanceTestMode(req, res) {
    const dbManager = DatabaseManager.getInstance();
    await dbManager.deactivateTestDB();
    testModeActive = false;
    testAdminUsername = null;
    res.status(201).json({ message: 'testing stopped' });
}

export {
    startPerformanceTestMode,
    endPerformanceTestMode,
    testModeActive,
    testAdminUsername,
};
