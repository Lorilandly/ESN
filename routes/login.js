import express from 'express';
import passport from 'passport';
import { authenticateUser } from '../controllers/auth.js';
let router = express.Router();

router.post(
    '/',
    passport.authenticate('local', { session: false }),
    authenticateUser,
    (req, res) => {
        return res.status(200).json({});
    },
);

export default router;
