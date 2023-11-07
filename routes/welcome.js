import express from 'express';
import passport from 'passport';
const router = express.Router();

/* GET users listing. */
router.get(
    '/',
    passport.authenticate('jwt', { failureRedirect: '/', session: false }),
    (req, res) => {
        return res.render('welcome');
    },
);

export default router;
