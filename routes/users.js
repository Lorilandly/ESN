import express from 'express';
let router = express.Router();

import {
    sendJwtCookie,
    create,
    validateNewCredentials,
    getAllUsers,
} from '../controllers/auth.js';

/* POST new user */
router.post(
    '/',
    await validateNewCredentials,
    await create,
    sendJwtCookie,
    (req, res) => {
        res.status(201).json({});
    },
);

router.get('/', await getAllUsers, (req, res) => {
    res.render('index');
});

export default router;
