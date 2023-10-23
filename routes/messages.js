import express from 'express';
import passport from 'passport';
import {
    createMessage,
    getAllPublicMessages,
    getAllPrivateMessages,
    getAllNewPrivateMessages,
    updatePrivateMessagesStatus,
} from '../controllers/message.js';
let router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/public', async (req, res) => {
    const messages = await getAllPublicMessages();
    return res.status(200).json({ messages: messages });
});

router.post('/public', await createMessage, async (req, res) => {
    return res.status(201).json({});
});

router.get('/private', async (req, res) => {
    const messages = await getAllPrivateMessages(
        req.query.senderId,
        req.query.receiverId,
    );
    return res.status(200).json({ messages: messages });
});

router.post('/private', await createMessage, async (req, res) => {
    return res.status(201).json({});
});

router.get('/private/new', async (req, res) => {
    const messages = await getAllNewPrivateMessages(req.query.receiverId);
    return res.status(200).json({ messages: messages });
});

router.put('/private/readStatus', async (req, res) => {
    await updatePrivateMessagesStatus(req.body.receiverId);
    return res.status(204).json({});
});

export default router;
