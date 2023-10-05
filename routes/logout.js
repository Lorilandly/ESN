import express from 'express';
import passport from 'passport';
import { deauthenticateUser } from '../controllers/auth.js';
let router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', deauthenticateUser, (req, res) => {
    return res.redirect('/');
});

export default router;
