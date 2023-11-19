import ReplyModel from '../models/reply.js';

let ioInstance = null;

function initIOInstanceForReply(io) {
    ioInstance = io;
}

async function createReply(req, res, next) {
    const userID = req.user.id;
    const postID = req.body.postID;
    const time = new Date(Date.now()).toLocaleString();
    const body = req.body.body;
    if (body.length === 0){
        return new Error('Reply body cannot be empty');
    };

    const replyID = req.body.replyID;
    const reply = new ReplyModel({
        senderId: userID,
        postId: postID,
        replyId: replyID,
        body: body,
        time: time,
    });

    await reply.persist();
    try{
        ioInstance.emit('create new reply', {postID: postID});
    }
    catch(err){
    }
    return next();
}

async function getAllReplyFromPost(postID) {
    return ReplyModel.getAllReplyFromPost(postID);
}

export {
    initIOInstanceForReply,
    createReply,
    getAllReplyFromPost,
};