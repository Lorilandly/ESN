import MessageModel from '../models/message.js';
import UserModel from '../models/user.js';
import jwt from 'jsonwebtoken';
import { testModeActive, testUserId } from './performanceTest.js';

let ioInstance = null;

function initIOInstanceForChat(io) {
    ioInstance = io;
}

async function createMessage(req, res, next) {
    let username = req.user.username;
    let userId = req.user.id;

    // Receiver Id 0 is for public chat
    let body = req.body.message;
    let time = new Date(Date.now()).toLocaleString();
    let user = req.user;
    userId = testModeActive ? testUserId : userId;
    let status = user.status;
    let receiverId = req.body.receiverId ? parseInt(req.body.receiverId) : 0;
    let readStatus = 'UNREAD';
    let message = new MessageModel(
        userId,
        receiverId,
        body,
        time,
        status,
        readStatus,
    );
    await message.persist();

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
        const messages = await MessageModel.getAllNewPrivateMessages(receiverId);
        return messages;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function updatePrivateMessagesStatus(receiverId) {
    try {
        await MessageModel.updatePrivateMessagesStatus(receiverId);
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
    updatePrivateMessagesStatus,
};
