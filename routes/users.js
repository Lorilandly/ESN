import express from 'express';
let router = express.Router();

import {
    authenticateUser,
    create,
    validateNewCredentials,
    getAllUsers,
} from '../controllers/auth.js';

/* POST new user */
router.post(
    '/',
    await validateNewCredentials,
    await create,
    authenticateUser,
    (req, res) => {
        res.status(201).json({});
    },
);

router.get('/', async (req, res) => {
    const users = await getAllUsers();
    if (users) {
        return res.status(200).json(await getAllUsers(req, res));
    } else {
        res.sendStatus(500);
    }
});

export default router;
