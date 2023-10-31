import MessageModel from '../models/message.js';
import { testModeActive, testUserId } from './performanceTest.js';

let ioInstance = null;

function initIOInstanceForChat(io) {
    ioInstance = io;
}

async function createMessage(req, res, next) {
    const username = req.user.username;
    let userId = req.user.id;

    // Receiver Id 0 is for public chat
    const body = req.body.message;
    const time = new Date(Date.now()).toLocaleString();
    const user = req.user;
    userId = testModeActive ? testUserId : userId;
    const status = user.status;
    const receiverId = req.body.receiverId ? parseInt(req.body.receiverId) : 0;
    const readStatus = 'UNREAD';
    const message = new MessageModel(
        userId,
        receiverId,
        body,
        time,
        status,
        readStatus,
    );
    await message.persist();

    if (receiverId === 0) {
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
        const messages =
            await MessageModel.getAllNewPrivateMessages(receiverId);
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
