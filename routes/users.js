import express from 'express';
let router = express.Router();

import {
    authenticateUser,
    create,
    validateNewCredentials,
    getAllUsers,
} from '../controllers/auth.js';

/* POST new user */
router.post(
    '/',
    await validateNewCredentials,
    await create,
    authenticateUser,
    (req, res) => {
        res.status(201).json({});
    },
);

router.get('/', (req, res) => {
    getAllUsers(req, res, () => {
        res.render('index');
    });
});

export default router;