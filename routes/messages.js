import express from 'express';
import passport from 'passport';
import {
    createMessage,
    getAllPublicMessages,
    getAllPrivateMessages,
    getAllNewPrivateMessages,
    updatePrivateMessagesStatus,
} from '../controllers/message.js';
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/public', async (req, res) => {
    const messages = await getAllPublicMessages();
    return res.status(200).json({ messages });
});

router.post('/public', await createMessage, async (req, res) => {
    return res.status(201).json({});
});

router.get('/private', async (req, res) => {
    const myId = req.user.id;
    const otherId = req.query.receiverId;
    const messages = await getAllPrivateMessages(myId, otherId);
    return res.status(200).json({ messages });
});

router.post('/private', await createMessage, async (req, res) => {
    return res.status(201).json({});
});

router.get('/private/new', async (req, res) => {
    const messages = await getAllNewPrivateMessages(req.user.id);
    return res.status(200).json({ messages });
});

router.put('/private/readStatus', async (req, res) => {
    await updatePrivateMessagesStatus(req.body.receiverId);
    return res.status(204).json({});
});

export default router;
