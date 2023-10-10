import express from 'express';
import passport from 'passport';
let router = express.Router();

import {
    setJwtCookie,
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
    setJwtCookie,
    (req, res) => {
        res.status(201).json({});
    },
);

router.post(
    '/:id/status',
    await passport.authenticate('jwt', { session: false }),
    (req, res) => {
        userId = req.params.id;
    },
);

router.get(
    '/:id/status', (req, res) => {
        passport.authenticate('jwt', (err, user) => {
            if (user) return res.status(200).json({status: user.currentStatus});
            if (err) return res.status(500).json({});
            return res.status(401).json({});
        })(req, res);
    }
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

export default router;
