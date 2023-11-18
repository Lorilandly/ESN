import express from 'express';
import passport from 'passport';
import{
    createPost,
    getAllUnresolvedPosts,
    getPostInfo,
    getMyPosts,
    resolvePost
} from '../controllers/post.js'
import {
    createReply,
    getAllReplyFromPost
} from '../controllers/reply.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res) => {
    return res.render('lostAndFound');
});

router.post('/', createPost, async(req, res) => {
    return res.status(201).json({});
})

router.get('/myPosts', async(req, res) => {
    return getMyPosts(req.query.userID)
    .then((posts) => res.status(200).json({ posts }))
    .catch((err) => {
        console.error(err);
        return res.sendStatus(500);
    });
});

router.post('/myPosts/resolve', resolvePost, async(req, res) => {
    return res.status(201).json({});
});

router.get("/unresolved", async(req, res) => {
    return getAllUnresolvedPosts()
    .then((posts) => res.status(200).json({ posts }))
    .catch((err) => {
        console.error(err);
        return res.sendStatus(500);
    });
});

router.get('/post/:id', async (req, res) => {
    return res.render('post');
});

router.get('/post/:id/info', async (req, res) => {
    const postId = req.params.id;
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
    })
});


router.post('/post/:id/reply', createReply,  async (req, res) => {
    return res.status(201).json({});
});


export default router;