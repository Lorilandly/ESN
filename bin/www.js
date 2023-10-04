#!/usr/bin/env node

/**
 * Module dependencies.
 */
import app from '../app.js';
import debug from 'debug';
import http from 'http';
import config from 'config';
import 'dotenv/config';
import { createDBPool, initModels } from '../db.js';
import { initAuthController } from '../controllers/auth.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

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
initModels(dbPool);

/**
 * Create HTTP server.
 */

let server = http.createServer(app);
const io = new Server(server);

// TODO: init AuthController with login-logout flow by passing in 
//setIOInAuthController(io);

io.on('connection', (socket) => {
    console.log('A user connected');

    let cookie = socket.request.headers.cookie; 

    //let cookieParts = cookie.split.(";")("=");
    console.log("Index of jwt token " + cookie.indexOf('jwtToken'));
    let jwtIndex = cookie.indexOf('jwtToken');

    let jwtToken = cookie.substring(jwtIndex).split("=")[1];
    console.log("jwt token: " + jwtToken);

    const decodedUser = jwt.verify(jwtToken, process.env.SECRET_KEY);
    console.log(`user ${decodedUser.username} connected`);

    socket.on('online', (data) => {
        console.log("Data: " + data);
    })

    // Handle user disconnection for offline status
    socket.on('disconnect', (username) => {
        // TODO: update it in the database
        io.emit('userStatus', { username: decodedUser.username, status: 'OFFLINE' });
        // update their status in the database
        console.log("   emit user status to offline");
    });
});

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

    let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

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
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('18652-fse-f23-group-project-sb-2:server')('Listening on ' + bind);
    console.log("--Server listening");
}

export { io };