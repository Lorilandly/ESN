import express from 'express';
import { checkUserAuthenticated } from '../controllers/auth.js';
import { getAllPublicMessages } from '../controllers/publicMessages.js';
let router = express.Router();

router.get('/', checkUserAuthenticated, getAllPublicMessages, (req, res) => {
    res.render('publicWall');
});

export default router;
