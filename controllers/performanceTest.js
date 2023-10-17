import MessageModel from '../models/message.js';
import { createTestDB, initModels, getDBPool } from '../db.js';

let testDBName = "sb2-project-performance";
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

    // get current DB pool
    let savedDBPool = getDBPool();
    
    // create test database using existing db
    // 1. createTestDB
        // 2. connect to testDB pool
    let pool = await createTestDB(savedDBPool, testDBName);

    console.log(`test pool: ${JSON.stringify(pool)}`);

    await initModels(pool);

    // init models with new DB pool
    // await MessageModel.initModel(pool);

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

    // 3. delete test database

    // reinstall old DB Pool
    initModels(savedDBPool);
}

export { initPerformanceTestController, startPerformanceTestMode };
