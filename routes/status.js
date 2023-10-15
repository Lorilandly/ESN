import express from 'express';
import passport from 'passport';

let router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res) => {
    return res.render('status');
});

export default router;
