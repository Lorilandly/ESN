import express from 'express';
import passport from 'passport';
import updateUserStatus from '../controllers/status.js';

import {
    setJwtCookie,
    validateNewCredentials,
    deauthenticateUser,
    checkUserAuthenticated,
} from '../controllers/auth.js';
import { create, getAllUsers, getUserByName } from '../controllers/user.js';
const router = express.Router();

/* GET all users */
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        return getAllUsers()
            .then((users) => res.status(200).json(users))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(500);
            });
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
    '/status',
    await passport.authenticate('jwt', { session: false }),
    updateUserStatus,
    (req, res) => {
        return res.status(200).json({});
    },
);

// return current user status
router.get(
    '/status',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        return res.status(200).json({ status: req.user.status });
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

router.get('/current', checkUserAuthenticated, async (req, res) => {
    const user = await getUserByName(req.user.username);
    return res.status(200).json(user);
});

export default router;
