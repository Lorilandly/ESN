import express from 'express';
import { validateUsername, validatePassword } from './auth.js';
import {findByName, checkPasswordForUser} from "../controllers/user.js";
let router = express.Router();

/* GET join page. */
router.get('/', (req, res) => {
    res.render('join');
});

/* POST join page. */
router.post('/', async (req, res) => {
	const { username, password } = req.body;
	if (!validateUsername(username)) {
		res.render("join", {
			errormsg: "Please provide a different username",
		});
		return;
	}
	if (!validatePassword(password)) {
		res.render("join", {
			errormsg: "Please provide a different password",
		});
		return;
	}
	// TODO: This will be modified while fleshing out login/logout flows
	const user = await findByName(username);
	if (user) {
		if (!await checkPasswordForUser(username, password)) {
			console.log(`password: ${user.password_hash}`);
			res.render("join", {
				errormsg: "Please re-enter username and password",
			});
			return;
		} else {
			res.redirect("welcome");
		}
	}
	// if (await userController.checkPasswordForUser(username, password)) {
	// 	console.log(`password: ${user.password_hash}`);
	// 	res.render("join", {
	// 		errormsg: "Please re-enter username and password",
	// 	});
	// 	return;
	// }

	res.render("join", {
		errormsg: "",
		username: username,
		password: password,
	});
});

export default router;
