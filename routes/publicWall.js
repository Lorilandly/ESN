import express from 'express';
import passport from 'passport';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res) => {
    return res.render('chat', { script: '/javascripts/publicWall.js' });
});

export default router;
