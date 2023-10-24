import express from 'express';
import passport from 'passport';
import updateUserStatus from '../controllers/status.js';
let router = express.Router();

import {
    setJwtCookie,
    create,
    validateNewCredentials,
    deauthenticateUser,
    getAllUsers,
    getUserByName,
    checkUserAuthenticated,
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

router.post(
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
        return res.status(200).json({ status: req.user.currentStatus });
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
