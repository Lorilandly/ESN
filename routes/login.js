import express from 'express';
import passport from 'passport';
import { sendJwtCookie } from '../controllers/auth.js';
let router = express.Router();

router.post(
    '/',
    passport.authenticate('local', { session: false }),
    sendJwtCookie,
    (req, res) => {
        return res.status(200).json({});
    },
);

export default router;
