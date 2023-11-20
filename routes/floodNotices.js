import express from 'express';
import passport from 'passport';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (_, res) => {
    return res.render('floodNotices');
});

router.get('/create', (_, res) => {
    return res.render('createFloodReport');
});

export default router;
