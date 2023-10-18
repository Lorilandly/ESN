import MessageModel from '../models/message.js';
import { initAndSetTestDB, deleteTestDBAndRestore } from '../db.js';

let ioInstance = null;
let testModeActive = false;
let testUserId = null;

function initPerformanceTestController(io) {
    ioInstance = io;
}

async function startPerformanceTestMode(testDuration, requestInterval) {
    // broadcast message to all connected users that performance test mode is starting
    ioInstance.emit('performance-mode-start');
    testUserId = await initAndSetTestDB();
    testModeActive = true;
}

async function endPerformanceTestMode() {
    await deleteTestDBAndRestore();
    testModeActive = false;
}

export {
    initPerformanceTestController,
    startPerformanceTestMode,
    endPerformanceTestMode,
    testModeActive,
    testUserId,
};
