import MessageModel from '../models/message.js';
import { createDBPool, initModels, getDBPool } from '../db.js';

let testDBHost = null;
let testDBPort = null;
let testDBName = null;
let ioInstance = null;

function initPerformanceTestController(host, port, name, io) {
    testDBHost = host;
    testDBPort = port;
    testDBName = name;
    ioInstance = io;
}

async function startPerformanceTestMode(testDuration, requestInterval) {
    let startTime = new Date();
    console.log(
        `startPerformanceTest called with duration ${testDuration} and requestInterval ${requestInterval}`,
    );

    // broadcast message to all connected users that performance test mode is stating
    ioInstance.emit('performance-mode-start');

    // get current DB pool
    let savedDBPool = getDBPool();

    // create new DB pool
    let pool = createDBPool(testDBHost, testDBPort, testDBName);

    initModels(pool);

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

    // drop all the messages created during the test
    await MessageModel.dropAllMessages();

    // reinstall old DB Pool
    initModels(savedDBPool);
}

export { initPerformanceTestController, startPerformanceTestMode };
