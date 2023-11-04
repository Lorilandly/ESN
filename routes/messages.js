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
    return getAllPublicMessages()
        .then((messages) => res.status(200).json({ messages }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.post('/public', await createMessage, async (req, res) => {
    return res.status(201).json({});
});

router.get('/private', async (req, res) => {
    const myId = req.user.id;
    const otherId = req.query.receiverId;
    return getAllPrivateMessages(myId, otherId)
        .then((messages) => res.status(200).json({ messages }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.post('/private', await createMessage, async (req, res) => {
    return res.status(201).json({});
});

router.get('/private/new', async (req, res) => {
    return getAllNewPrivateMessages(req.user.id)
        .then((messages) => res.status(200).json({ messages }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.put('/private/readStatus', async (req, res) => {
    return updatePrivateMessagesStatus(req.body.receiverId)
        .then(() => res.sendStatus(204))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

export default router;
