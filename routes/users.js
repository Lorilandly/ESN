import express from 'express';
import passport from 'passport';
let router = express.Router();

import {
    sendJwtCookie,
    create,
    validateNewCredentials,
    deauthenticateUser,
    getAllUsers,
} from '../controllers/auth.js';

/* GET all users */
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const users = await getAllUsers();
        if (users) {
            return res.status(200).json(users);
        } else {
            return res.sendStatus(500);
        }
    },
);

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

router.put(
    '/login',
    passport.authenticate('local', { session: false }),
    sendJwtCookie,
    (req, res) => {
        return res.status(200).json({});
    },
);

router.put(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    deauthenticateUser,
    (req, res) => {
        return res.status(200).json({});
    },
);

export default router;
