import express from 'express';
import { checkValidUsernamePassword } from "../controllers/user.js";
let router = express.Router();

/* GET join page. */
router.get('/', (req, res) => {
    res.render('join');
});

/* POST join page. */
router.post('/', await checkValidUsernamePassword, (req, res) => {
    const { username, password, msg } = res.locals.data;
    let errormsg;
    switch (msg) {
        case "bad username":
            errormsg = "Please provide a different username"
            break;
        case "bad password":
            errormsg = "Please provide a different password"
            break;
        case "username taken":
            errormsg = "The username is taken"
            break;
        case "login":
            res.redirect("/");
            break;
    }
    res.render("join", { errormsg, username, password })
});

export default router;
