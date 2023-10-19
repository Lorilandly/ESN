import express from 'express';
import passport from 'passport';
import {
    createMessage,
    getAllPublicMessages,
    getAllPrivateMessages,
} from '../controllers/message.js';
let router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/public', async (req, res) => {
    const messages = await getAllPublicMessages();
    return res.status(200).json({ messages: messages });
});

router.post('/public', await createMessage);

router.get('/private', async (req, res) => {
    const messages = await getAllPrivateMessages(
        req.query.senderId,
        req.query.receiverId,
    );
    return res.status(200).json({ messages: messages });
});

router.post('/private', await createMessage);

export default router;
