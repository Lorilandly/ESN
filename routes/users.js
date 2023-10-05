import express from 'express';
let router = express.Router();

import {
    sendJwtCookie,
    create,
    validateNewCredentials,
    getAllUsers,
} from '../controllers/auth.js';

/* POST new user */
router.post(
    '/',
    await validateNewCredentials,
    await create,
    sendJwtCookie,
    (req, res) => {
        res.status(201).json({});
    },
);

router.get('/', async (req, res) => {
    const users = await getAllUsers();
    if (users) {
        return res.status(200).json(users);
    } else {
        return res.sendStatus(500);
    }
});

export default router;
