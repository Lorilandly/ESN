import MessageModel from '../models/message.js';
import { initAndSetTestDB, initModels, deleteTestDBAndRestore } from '../db.js';

let ioInstance = null;

function initPerformanceTestController(io) {
    ioInstance = io;
}

async function startPerformanceTestMode(testDuration, requestInterval) {
    let startTime = new Date();
    console.log(
        `startPerformanceTest called with duration ${testDuration} and requestInterval ${requestInterval}`,
    );

    // broadcast message to all connected users that performance test mode is starting
    ioInstance.emit('performance-mode-start');

    await initAndSetTestDB();

    console.log('performance test mode active!!!');

    let sender_id = 0;
    let receiver_id = 1;
    let body = 'This is a test message';
    let time = new Date();
    let status = 'ONLINE';
    let message = new MessageModel(sender_id, receiver_id, body, time, status);
    await message.persist();

    console.log(
        `End of performance test mode, time taken: ${new Date() - startTime}`,
    );
}

async function endPerformanceTestMode() {
    await deleteTestDBAndRestore();
}

export {
    initPerformanceTestController,
    startPerformanceTestMode,
    endPerformanceTestMode,
};
