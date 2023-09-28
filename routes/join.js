import express from "express";
import { validateUsernamePassword } from "../controllers/auth.js";
let router = express.Router();

/* GET join page. */
router.get("/", (req, res) => {
	res.render("join");
});

/* POST join page. */
router.post("/", await validateUsernamePassword, (req, res) => {
	const { username, password, msg } = res.locals.data;
	let errormsg;
	switch (msg) {
		case "bad username":
			errormsg = "Please provide a different username";
			break;
		case "bad password":
			errormsg = "Please provide a different password";
			break;
		case "username taken":
			errormsg = "The username is taken";
			break;
		case "login":
			res.redirect("/");
			break;
	}
	console.log(`about to render join`);
	res.render("join", { errormsg, username, password });
});

export default router;
