import express from 'express';
import passport from 'passport';
import { checkUserAuthenticated } from '../controllers/auth.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/:receiverId', checkUserAuthenticated, (req, res) => {
    return res.render('chat', { script: '/javascripts/privateChat.js' });
});

export default router;
