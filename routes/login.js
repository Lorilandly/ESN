import express from 'express';
import { validateCredentials, authenticateUser } from '../controllers/auth.js';
let router = express.Router();

router.post('/', await validateCredentials, authenticateUser, (req, res) => {
    return res.status(200).json({});
});

export default router;
