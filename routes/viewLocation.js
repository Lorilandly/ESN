import express from 'express';
import passport from 'passport';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', async (req, res) => {
    return res.render('currentLocation');
});

export default router;
