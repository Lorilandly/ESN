import DatabaseManager from '../db.js';

let testModeActive = false;
let testAdminUsername = null;
let testUserId = null;

async function startPerformanceTestMode(req, res) {
    const dbManager = DatabaseManager.getInstance();
    testAdminUsername = req.user.username;
    testUserId = await dbManager.activateTestDB();
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
    testUserId,
};
