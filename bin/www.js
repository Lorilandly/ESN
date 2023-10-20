#!/usr/bin/env node

/**
 * Module dependencies.
 */
import 'dotenv/config';
import app from '../app.js';
import debug from 'debug';
import http from 'http';
import config from 'config';
import { createDBPool, initModels } from '../db.js';
import {
    initAuthController,
    handleSocketConnections,
} from '../controllers/auth.js';
import { initIOInstanceForChat } from '../controllers/publicMessage.js';
// import { initPerformanceTestController } from '../controllers/performanceTest.js';
import { Server } from 'socket.io';

/**
 * Get port from environment and store in Express.
 */

const serverPort = normalizePort(config.get('server.port'));
app.set('port', serverPort);

/**
 * Configure controllers
 */
initAuthController(config.get('auth'));

/**
 * Get database configs and connect to database.
 */
const dbHost = config.get('db.host');
const dbPort = normalizePort(config.get('db.port'));
const dbName = config.get('db.name');
const dbPool = createDBPool(dbHost, dbPort, dbName);

/**
 * Use database connection to initialize our data models.
 */
await initModels(dbPool);

/**
 * Create HTTP server.
 */

let server = http.createServer(app);
const io = new Server(server);

/**
 * Get test database configs for performance test controller configuration.
 */

initIOInstanceForChat(io);
handleSocketConnections(io);
// initPerformanceTestController(io);

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
    let port = parseInt(val, 10);

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

    let bind =
        typeof serverPort === 'string'
            ? 'Pipe ' + serverPort
            : 'Port ' + serverPort;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('18652-fse-f23-group-project-sb-2:server')('Listening on ' + bind);
}

export { io };
