let User = require("../models/user").User;

function create(req, res, next) {
    const { username, password } = req.body;
    const message = `Join Successful: username=${username}, password=${password}`;
    User.create(username.toLowerCase(), password, "SUPERDUPERADMIN", "DEAD");
    next();
}

async function findByName(name) {
	return await User.findByName(name.toLowerCase());
}

module.exports = { create, findByName };
