import DatabaseManager from '../db.js';
import UserModel from '../models/user.js';
import { setJwtCookie } from './auth.js';

let testModeActive = false;
let testAdminUsername = null;
let testAdminID = null;

async function startPerformanceTestMode(req, res) {
    const dbManager = DatabaseManager.getInstance();
    testAdminUsername = req.user.username;
    const testAdminUser = await UserModel.findByName(testAdminUsername);

    await dbManager.activateTestDB();
    // save admin user to test db
    testAdminID = await testAdminUser.persist().catch((err) => {
        console.warn(err);
    });
    testModeActive = true;
    setJwtCookie(
        testAdminID,
        testAdminUsername,
        testAdminUser.privilege,
        res,
    ).then((res) => res.status(201).json({ message: 'test mode active' }));
}

async function endPerformanceTestMode(req, res) {
    const dbManager = DatabaseManager.getInstance();
    await dbManager.deactivateTestDB();
    const user = await UserModel.findByName(testAdminUsername);
    setJwtCookie(user.id, user.username, user.privilege, res)
        .then((res) => {
            testModeActive = false;
            testAdminUsername = null;
            testAdminID = null;
            res.status(201).json({ message: 'testing stopped' });
        })
        .catch((err) => {
            console.error(err);
            testModeActive = false;
            testAdminUsername = null;
            testAdminID = null;
            res.sendStatus(500);
        });
}

export {
    startPerformanceTestMode,
    endPerformanceTestMode,
    testModeActive,
    testAdminUsername,
    testAdminID,
};
