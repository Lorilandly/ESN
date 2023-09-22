import express from 'express';
let router = express.Router();
import { create } from '../controllers/user.js';

/* POST new user */
router.post('/', create, (req, res) => {
    res.redirect("welcome");
});

export default router;
