import express from 'express';
import { checkUserAuthenticated } from '../controllers/auth.js';
let router = express.Router();

router.use(checkUserAuthenticated);

/* GET home page. */
router.get('/', (req, res) => {
    if (!res.locals.isAuthenticated) {
        return res.render('join');
    } else {
        return res.redirect('/users');
    }
});

export default router;
