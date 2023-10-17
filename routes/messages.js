import express from 'express';
import passport from 'passport';
import {
    createPublicMessage,
    getAllPublicMessages,
    //getAllPrivateMessages
} from '../controllers/publicMessage.js';
let router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/public', async (req, res) => {
    const messages = await getAllPublicMessages();
    return res.status(200).json({ messages: messages });
});

router.post('/public', await createPublicMessage);

router.get('/private', async (req, res) => {

    //const messages = await getAllPrivateMessages(req.sender_name, req.receiver_id);
    return res.status(200).json({ messages: messages });
});

router.post('/private', await createPublicMessage);

export default router;
