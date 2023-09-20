let express = require('express');
let router = express.Router();
let auth = require('./auth');
let userController = require("../controllers/user");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('join');
});

/* POST join page. */
router.post('/', async function (req, res, next) {
	const { username, password } = req.body;
	if (!auth.validateUsername(username)) {
		res.render("join", {
			errormsg: "Please provide a different username",
		});
		return;
	}
	if (!auth.validatePassword(password)) {
		res.render("join", {
			errormsg: "Please provide a different password",
		});
		return;
	}
	// TODO: This will be modified while fleshing out login/logout flows
	user = await userController.findByName(username);
	if (user && user.password_hash != password) {
		console.log(`password: ${user.password_hash}`);
		res.render("join", {
			errormsg: "Please re-enter username and password",
		});
		return;
	}

	res.render("join", {
		errormsg: "",
		username: username,
		password: password,
	});
});

module.exports = router;
