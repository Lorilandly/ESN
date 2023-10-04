import express from 'express';
import { deauthenticateUser } from '../controllers/auth.js';
let router = express.Router();

router.get('/', deauthenticateUser, (req, res) => {
    return res.redirect('/');
});

export default router;
