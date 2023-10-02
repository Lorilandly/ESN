import express from 'express';
import { checkUserAuthenticated } from '../controllers/auth.js';
let router = express.Router();

router.use(checkUserAuthenticated);

/* GET home page. */
router.get('/', (req, res) => {
    if (!res.locals.isAuthenticated) {
        res.render('join');
    } else {
        res.redirect('/users');
    }
});

export default router;
