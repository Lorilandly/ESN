import express from 'express';
import passport from 'passport';
let router = express.Router();

import {
    setJwtCookie,
    create,
    validateNewCredentials,
    deauthenticateUser,
    getAllUsers,
    getCurrentUserId,
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
    setJwtCookie,
    (req, res) => {
        res.status(201).json({});
    },
);

router.put(
    '/login',
    passport.authenticate('local', { session: false }),
    setJwtCookie,
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

router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const userId = await getCurrentUserId(req);
        console.log("id " + userId);
        return res.status(200).json({userId: userId});
    },
);

export default router;
