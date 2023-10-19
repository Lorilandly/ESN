import MessageModel from '../models/message.js';
import UserModel from '../models/user.js';
import { userSocketMapping } from './auth.js';
import jwt from 'jsonwebtoken';

let ioInstance = null;

function initIOInstanceForChat(io) {
    ioInstance = io;
}

async function createMessage(req, res, next) {
    const token = req.cookies.jwtToken;
    let userId, username;
    if (!token) {
        // handle case where user isn't authenticated
        return res.status(401).json({});
    }
    try {
        const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
        // handle decodedUser (username) string
        username = decodedUser.username;
        userId = await UserModel.findIdByName(username);
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
    let status = 'STATUS';
    let receiverId = 0;
    if (req.body.receiverId) {
        receiverId = req.body.receiverId;
    }
    let readStatus = 'UNREAD';
    let message = new MessageModel(userId, receiverId, body, time, status, readStatus);
    await message.persist();

    if (receiverId == 0) {
        ioInstance.emit('create public message', {
            username,
            time,
            status,
            body,
        });
    } else {
        ioInstance.to(userSocketMapping[receiverId]).emit('create private message', {
            username,
            time,
            status,
            body,
            userId,
            receiverId,
        });
        ioInstance.to(userSocketMapping[receiverId]).emit('new message', {
            username,
            time,
            status,
            body,
            userId,
            receiverId,
        });
        ioInstance.to(userSocketMapping[userId]).emit('create private message', {
            username,
            time,
            status,
            body,
            userId,
            receiverId,
        });

    }

    return next();
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

async function getAllNewPrivateMessages(receiverId) {
    try {
        const messages = await MessageModel.getAllNewPrivateMessages(
            receiverId,
        );
        return messages;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function updatePrivateMessagesStatus(receiverId) {
    try {
        await MessageModel.updatePrivateMessagesStatus(
            receiverId,
        );
        ioInstance.to(userSocketMapping[receiverId]).emit('new messages viewed');
    } catch (err) {
        console.error(err);
    }
}

export {
    initIOInstanceForChat,
    createMessage,
    getAllPublicMessages,
    getAllPrivateMessages,
    getAllNewPrivateMessages,
    updatePrivateMessagesStatus
};
