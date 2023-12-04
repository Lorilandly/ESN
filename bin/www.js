#!/usr/bin/env node

/**
 * Module dependencies.
 */
import 'dotenv/config';
import app from '../app.js';
import debug from 'debug';
import http from 'http';
import config from 'config';
import DatabaseManager from '../db.js';
import {
    initAuthController,
    handleSocketConnections,
} from '../controllers/auth.js';
import { initFloodReportController } from '../controllers/floodReport.js';
import { initIOInstanceForChat } from '../controllers/message.js';
import { initIOInstanceForLocation } from '../controllers/location.js';
import { initIOInstanceForResponse } from '../controllers/response.js';
import { initIOInstanceForPost } from '../controllers/post.js';
import { initIOInstanceForReply } from '../controllers/reply.js';
import { initIOInstanceForAdmin } from '../controllers/profileElement.js';
import { Server } from 'socket.io';

/**
 * Get port from environment and store in Express.
 */

const serverPort = normalizePort(config.get('server.port'));
app.set('port', serverPort);

/**
 * Get database configs and connect to database.
 */
const dbManager = DatabaseManager.getInstance();

const dbHost = config.get('db.host');
const dbPort = normalizePort(config.get('db.port'));
const dbName = config.get('db.name');
dbManager.configureDB(dbHost, dbPort, dbName);
await dbManager.activateDB();

const testDBHost = config.get('performance-test-db.host');
const testDBPort = normalizePort(config.get('performance-test-db.port'));
const testDBName = config.get('performance-test-db.name');
dbManager.configureTestDB(testDBHost, testDBPort, testDBName);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
const io = new Server(server);

/**
 * Get test database configs for performance test controller configuration.
 */
initAuthController(config.get('auth'));
initIOInstanceForChat(io);
initIOInstanceForLocation(io);
initIOInstanceForResponse(io);
initIOInstanceForPost(io);
initIOInstanceForReply(io);
initIOInstanceForAdmin(io);
handleSocketConnections(io);
initFloodReportController(io, config.get('flood-report'));

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(serverPort);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind =
        typeof serverPort === 'string'
            ? 'Pipe ' + serverPort
            : 'Port ' + serverPort;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind =
        typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('18652-fse-f23-group-project-sb-2:server')('Listening on ' + bind);
}

export { io };
