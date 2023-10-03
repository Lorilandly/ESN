import express from 'express';
import { validateCredential, authenticateUser } from '../controllers/auth.js';
let router = express.Router();

router.post('/', await validateCredential, authenticateUser, (req, res) => {
    return res.status(200).json({});
});

export default router;
