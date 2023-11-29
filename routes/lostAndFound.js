import express from 'express';
import passport from 'passport';
import {
    createPost,
    getAllUnresolvedPosts,
    getPostInfo,
    getMyPosts,
    resolvePost,
} from '../controllers/post.js';
import {
    createReply,
    getAllReplyFromPost,
} from '../controllers/reply.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res) => {
    return res.render('lostAndFound');
});

router.post('/', createPost, async (req, res) => {
    return res.status(201).json({});
});

router.get('/myPosts', async (req, res) => {
    return getMyPosts(req.query.userID)
        .then((posts) => res.status(200).json({ posts }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.post('/myPosts/status', resolvePost, async (req, res) => {
    return res.status(201).json({});
});

router.get('/unresolved', async (req, res) => {
    return getAllUnresolvedPosts()
        .then((posts) => res.status(200).json({ posts }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.get('/posts/:id', async (req, res) => {
    if (req.params.id <= 0) {
        return res.sendStatus(500);
    }
    return res.render('post');
});

router.get('/posts/:id/info', async (req, res) => {
    const postId = req.params.id;
    if (postId <= 0) {
        return res.sendStatus(500);
    }
    // get post information and all replies
    return getPostInfo(postId)
        .then((post) => {
            getAllReplyFromPost(postId)
                .then((replies) => {
                    return res.status(200).json({ post, replies });
                })
                .catch((err) => {
                    console.error(err);
                    return res.sendStatus(500);
                });
        });
});

router.post('/posts/:id/response', createReply, async (req, res) => {
    if (req.params.id <= 0) {
        return res.sendStatus(500);
    }
    return res.status(201).json({});
});

export default router;
