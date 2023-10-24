import MessageModel from '../models/message.js';
import UserModel from '../models/user.js';
import jwt from 'jsonwebtoken';
import { testModeActive, testUserId } from './performanceTest.js';

let ioInstance = null;

function initIOInstanceForChat(io) {
    ioInstance = io;
}

async function createMessage(req, res) {
    const token = req.cookies.jwtToken;
    let user, userId, username;
    if (!token) {
        // handle case where user isn't authenticated
        return res.status(401).json({});
    }
    try {
        const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
        // handle decodedUser (username) string
        username = decodedUser.username;
        userId = await UserModel.findIdByName(username);
        user = await UserModel.findByName(username);
    } catch {
        // handle failure to decode JWT
        return res.status(401).json({});
    }

    if (!userId || !username) {
        return res.status(401).json({});
    }
    if (!req.body.message) {
        return res.status(400).json({ status: 'No messages provided' });
    }

    // Receiver Id 0 is for public chat
    let body = req.body.message;
    let time = new Date(Date.now()).toLocaleString();
    console.log(`user is ` + JSON.stringify(user));
    userId = testModeActive ? testUserId : userId;
    let status = user.status;
    let receiverId = 0;
    if (req.body.receiverId) {
        receiverId = req.body.receiverId;
    }
    let message = new MessageModel(userId, receiverId, body, time, status);
    await message.persist();
    console.log(`testMode: `, testModeActive);
    if (!testModeActive) {
        if (receiverId == 0) {
            ioInstance.emit('create public message', {
                username,
                time,
                status,
                body,
            });
        } else {
            ioInstance.emit('create private message', {
                username,
                time,
                status,
                body,
                userId,
                receiverId,
            });
        }
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

async function getAllPrivateMessages(senderId, receiverId) {
    try {
        const messages = await MessageModel.getAllPrivateMessages(
            senderId,
            receiverId,
        );
        return messages;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export {
    initIOInstanceForChat,
    createMessage,
    getAllPublicMessages,
    getAllPrivateMessages,
};
