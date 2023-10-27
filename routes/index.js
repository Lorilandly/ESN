import express from 'express';
import passport from 'passport';
const router = express.Router();

/* GET home page. */
router.get(
    '/',
    passport.authenticate('jwt', { session: false, failureRedirect: '/join' }),
    (req, res) => {
        return res.render('index');
    },
);

export default router;
