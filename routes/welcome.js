import express from 'express';
import passport from 'passport';
let router = express.Router();

/* GET users listing. */
router.get(
    '/',
    passport.authenticate('jwt', { failureRedirect: '/', session: false }),
    (req, res) => {
        res.render('welcome');
    },
);

export default router;
