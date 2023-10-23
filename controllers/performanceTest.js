import dbManager from '../db.js';

let testModeActive = false;
let testAdminUsername = null;
let testUserId = null;

async function startPerformanceTestMode(req, res) {
    testAdminUsername = req.user.username;
    testUserId = await dbManager.initAndSetTestDB();
    testModeActive = true;
    res.status(201).json({ message: 'test mode active' });
}

async function endPerformanceTestMode(req, res) {
    await dbManager.deleteTestDBAndRestore();
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
