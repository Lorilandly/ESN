import PostModel from '../models/post.js';

let ioInstance = null;

function initIOInstanceForPost(io){
    ioInstance = io;
}

async function createPost(req, res, next){
    const userId = req.user.id;
    const time = new Date(Date.now()).toLocaleString();
    const title = req.body.title;
    const message = req.body.message;

    const post = new PostModel({
        senderId: userId,
        title: title,
        body: message,
        time: time,
        resolved: false,
    });

    await post.persist();
    ioInstance.emit('create new lost and found post');
    return next();
}

async function getAllUnresolvedPosts(){
    return PostModel.getAllUnresolvedPosts();
}

async function getPostInfo(postId){
    return PostModel.getPostInfo(postId);
}

async function getMyPosts(userId){
    return PostModel.getMyPosts(userId);
}

async function resolvePost(req, res, next){
    const postId = req.query.postID;
    await PostModel.resolvePost(postId);
    ioInstance.emit('resolve lost and found post');
    return next();
}

export{
    initIOInstanceForPost,
    createPost,
    getAllUnresolvedPosts,
    getPostInfo,
    getMyPosts,
    resolvePost,
};