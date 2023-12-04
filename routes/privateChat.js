import express from 'express';
import passport from 'passport';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/:receiverId', (req, res) => {
    return res.render('chat', { scriptPath: '/javascripts/privateChat.js' });
});

export default router;
