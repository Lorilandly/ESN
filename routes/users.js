import express from "express";
let router = express.Router();

import {
	authenticateUser,
	create,
	validateUsernamePassword,
} from "../controllers/auth.js";

/* POST new user */
router.post(
	"/",
	await validateUsernamePassword,
	(_, res, next) => {
		// Make sure user do not bypass username password checks
		if (res.locals.data.msg) {
			res.status(403).send({ message: "You sus" });
		}
		next();
	},
	await create,
	authenticateUser,
	(_, res) => {
		res.redirect("welcome");
	}
);

export default router;
