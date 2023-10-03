import express from 'express';
let router = express.Router();

import {
    authenticateUser,
    create,
    validateNewCredential,
    getAllUsers,
} from '../controllers/auth.js';

/* POST new user */
router.post(
    '/',
    await validateNewCredential,
    await create,
    authenticateUser,
    (req, res) => {
        res.status(201).json({});
    },
);

router.get('/', await getAllUsers, (req, res) => {
    res.render('index');
});

export default router;
