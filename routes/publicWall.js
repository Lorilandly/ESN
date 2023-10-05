import express from 'express';
import passport from 'passport';
import { checkUserAuthenticated } from '../controllers/auth.js';
let router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', checkUserAuthenticated, (req, res) => {
    return res.render('publicWall');
});

export default router;
