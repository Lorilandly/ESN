import MessageModel from '../models/message.js';
import UserModel from '../models/user.js';
import jwt from 'jsonwebtoken';

async function createPublicMessage(req, res) {
    const token = req.cookies.jwtToken;
    let user_id, username;
    if (!token) {
        // handle case where user isn't authenticated
        return res.status(401).json({});
    }
    try {
        const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
        // handle decodedUser (username) string
        username = decodedUser.username;
        user_id = await UserModel.findIdByName(username);
    } catch {
        // handle failure to decode JWT
        return res.status(401).json({});
    }

    if (!user_id || !username) {
        return res.status(401).json({});
    }
    if (!req.body.message) {
        return res.status(400).json({ status: 'No messages provided' });
    }
    // Receiver Id 0 is for public chat
    let message = new MessageModel(
        user_id,
        username,
        0,
        req.body.message,
        new Date(Date.now()).toISOString(),
    );
    await message.persist();
    return res.status(201).json({ status: 'success' });
}

async function getAllPublicMessages(req, res, next) {
    try {
        const messages = await messagesModel.getAllPublicMessages();
        res.locals.messages = messages;
        return next();
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

export { createPublicMessage, getAllPublicMessages };
