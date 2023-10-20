import MessageModel from '../models/message.js';
import { initAndSetTestDB, deleteTestDBAndRestore } from '../db.js';
import jwt from 'jsonwebtoken';

// let ioInstance = null;
let testModeActive = false;
let testAdminUsername = null;
let testUserId = null;

// function initPerformanceTestController(io) {
//     ioInstance = io;
// }

async function startPerformanceTestMode(req, res) {
    // broadcast message to all connected users that performance test mode is starting
    const token = req.cookies.jwtToken;
    let adminUsername;
    if (!token){
        return res.status(401).json({});
    }
    try {
        const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
        adminUsername = decodedUser.username;
    } catch {
        return res.status(401).json({});
    }
    testAdminUsername = adminUsername;
    // ioInstance.emit('performance-mode-start');
    testUserId = await initAndSetTestDB();
    testModeActive = true;

    res.status(201).json({ message: 'test mode active' });
}

async function endPerformanceTestMode(req, res) {
    await deleteTestDBAndRestore();
    testModeActive = false;
    testAdminUsername = null;
    res.status(201).json({ message: 'testing stopped' });
}

export {
    // initPerformanceTestController,
    startPerformanceTestMode,
    endPerformanceTestMode,
    testModeActive,
    testAdminUsername,
    testUserId,
};
