import express from 'express';
import passport from 'passport';
import { getUserProfile } from '../controllers/profile.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res) => {
    return res.render('profile');
});

router.get('/:id', async (req, res) => {
    return res.render('profile-mini', { profile: await getUserProfile(req.params.id, false) });
});

export default router;
