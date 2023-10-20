import MessageModel from '../models/message.js';
import UserModel from '../models/user.js';
import jwt from 'jsonwebtoken';
import { testModeActive, testUserId } from './performanceTest.js';

let ioInstance = null;

function initIOInstanceForChat(io) {
    ioInstance = io;
}

async function createPublicMessage(req, res) {
    const token = req.cookies.jwtToken;
    let user_id, username;
    if (!token) {
        // handle case where user isn't authenticated
        return res.status(401).json({});
    }
    try {
        // handle decodedUser (username) string
        const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
        username = decodedUser.username;
        user_id = await UserModel.findIdByName(username);
    } catch {
        // handle failure to decode JWT
        return res.status(401).json({});
    }

    if (!user_id || !username) {
        return res.status(401).json({});
    }
    if (!req.body.message) {
        return res.status(400).json({ status: 'No messages provided' });
    }

    // Receiver Id 0 is for public chat
    let body = req.body.message;
    let time = new Date(Date.now()).toLocaleString();
    let status = 'STATUS';
    user_id = testModeActive ? testUserId : user_id;
    let message = new MessageModel(user_id, 0, body, time, status);
    await message.persist();
    if(!testModeActive){
        ioInstance.emit('create message', { username, time, status, body });
    }
    return res.status(201).json({ status: 'success' });
}

async function getAllPublicMessages() {
    try {
        const messages = await MessageModel.getAllPublicMessages();
        return messages;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export { initIOInstanceForChat, createPublicMessage, getAllPublicMessages };
