import PostModel from '../models/post.js';

let ioInstance = null;

function initIOInstanceForPost(io) {
    ioInstance = io;
}

async function createPost(req, res, next) {
    const userId = req.user.id;
    const time = new Date(Date.now()).toLocaleString();
    const title = req.body.title;
    const message = req.body.message;

    if (title.length === 0 || message.length === 0) {
        return new Error('Post title or message cannot be empty');
    };

    const post = new PostModel({
        senderId: userId,
        title,
        body: message,
        time,
        resolved: false,
    });

    await post.persist();
    try {
        ioInstance.emit('create new lost and found post');
    } catch (err) {
    }
    return next();
}

async function getAllUnresolvedPosts() {
    return PostModel.getAllUnresolvedPosts();
}

async function getPostInfo(postId) {
    return PostModel.getPostInfo(postId);
}

async function getMyPosts(userId) {
    return PostModel.getMyPosts(userId);
}

async function resolvePost(req, res, next) {
    const postId = req.body.postID;
    const userId = req.user.id;
    await PostModel.resolvePost(postId);
    try {
        ioInstance.emit('resolve lost and found post', { userId });
    } catch (err) {
    }

    return next();
}

export {
    initIOInstanceForPost,
    createPost,
    getAllUnresolvedPosts,
    getPostInfo,
    getMyPosts,
    resolvePost,
};
