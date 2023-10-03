import express from 'express';
import { checkUserAuthenticated } from '../controllers/auth.js';
let router = express.Router();

/* GET users listing. */
router.get('/', checkUserAuthenticated, (req, res) => {
    return res.render('welcome');
});

export default router;
