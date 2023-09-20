let express = require("express");
let router = express.Router();
let auth = require("./auth");
let userController = require("../controllers/user");

/* GET home page. */
router.get("/", function (_, res, _) {
	res.render("index");
});

/* POST join page. */
router.post("/join", async function (req, res, _) {
	const { username, password } = req.body;
	if (!auth.validateUsername(username)) {
		res.render("index", {
			errormsg: "Please provide a different username",
		});
		return;
	}
	if (!auth.validatePassword(password)) {
		res.render("index", {
			errormsg: "Please provide a different password",
		});
		return;
	}
	// TODO: This will be modified while fleshing out login/logout flows
	user = await userController.findByName(username);
	if (user && user.password_hash != password) {
		console.log(`password: ${user.password_hash}`);
		res.render("index", {
			errormsg: "Please re-enter username and password",
		});
		return;
	}

	res.render("index", {
		errormsg: "",
		username: username,
		password: password,
	});
});

/* POST home page. */
router.post("/users", function (req, res, _) {
	const { username, password } = req.body;
	userController.create(username, password);
	const message = `Join Successful: username=${username}, password=${password}`;
	res.send(message);
});

module.exports = router;
