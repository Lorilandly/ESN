import express from 'express';
import { checkUserAuthenticated } from '../controllers/auth.js';
import { getAllPublicMessages } from '../controllers/publicMessage.js';
let router = express.Router();

router.get('/', checkUserAuthenticated, (req, res) => {
    res.render('publicWall');
});

export default router;
