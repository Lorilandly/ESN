import express from 'express';
let router = express.Router();
import { create, checkValidUsernamePassword } from '../controllers/user.js';

/* POST new user */
router.post('/', await checkValidUsernamePassword, (req, res, next) => {
    // Make sure user do not bypass username password checks
    if (res.locals.data.msg) {
        res.status(403).send({ message: "You sketchy" })
    }
    next()
}, create, (req, res) => {
    res.redirect("welcome");
});

export default router;
