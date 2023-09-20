let User = require("../models/user").User;

function create(username, password) {
	User.create(username.toLowerCase(), password, "SUPERDUPERADMIN", "DEAD");
}

async function findByName(name) {
	return await User.findByName(name.toLowerCase());
}

module.exports = { create, findByName };
