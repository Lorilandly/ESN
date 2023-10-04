import express from 'express';
import {
    createPublicMessage,
    getAllPublicMessages,
} from '../controllers/publicMessage.js';
let router = express.Router();

router.get('/', async (req, res) => {
    const messages = await getAllPublicMessages();
    return res.status(200).json({ messages: messages });
});

router.post('/', await createPublicMessage);

export default router;
