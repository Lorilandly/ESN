import MessageModel from '../models/message.js';

let ioInstance = null;

function initIOInstanceForChat(io) {
    ioInstance = io;
}

async function createMessage(req, res, next) {
    const username = req.user.username;

    // Receiver Id 0 is for public chat
    const body = req.body.message;
    const time = new Date(Date.now()).toLocaleString();
    const user = req.user;
    const status = user.status;
    const userId = req.user.id;
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

    try {
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
    } catch {}

    return next();
}

async function getAllPublicMessages() {
    return MessageModel.getAllPublicMessages();
}

async function getAllPrivateMessages(senderId, receiverId) {
    return MessageModel.getAllPrivateMessages(senderId, receiverId);
}

async function getAllNewPrivateMessages(receiverId) {
    return MessageModel.getAllNewPrivateMessages(receiverId);
}

async function updatePrivateMessagesStatus(receiverId) {
    return MessageModel.updatePrivateMessagesStatus(receiverId);
}

export {
    initIOInstanceForChat,
    createMessage,
    getAllPublicMessages,
    getAllPrivateMessages,
    getAllNewPrivateMessages,
    updatePrivateMessagesStatus,
};
