import express from 'express';
import passport from 'passport';
import { checkUserAuthenticated, validateUrlParam } from '../controllers/auth.js';

let router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/:senderId/:receiverId', checkUserAuthenticated, validateUrlParam, (req, res) => {
    return res.render('privateChat');
});

export default router;
