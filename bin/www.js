#!/usr/bin/env node

/**
 * Module dependencies.
 */
import app from '../app.js';
import debug from 'debug';
import http from 'http';
import config from 'config';
import { createDBPool, initModels } from '../db.js';

/**
 * Get port from environment and store in Express.
 */

let serverPort = normalizePort(config.get('server.port'));
app.set('port', serverPort);

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
initModels(dbPool);

/**
 * Create HTTP server.
 */

let server = http.createServer(app);

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

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

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
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('18652-fse-f23-group-project-sb-2:server')('Listening on ' + bind);
}
