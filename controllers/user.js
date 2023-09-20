let User = require("../models/user").User;

function create(username, password) {
	User.create(username, password, "SUPERDUPERADMIN", "DEAD");
}

async function findByName(name) {
	return await User.findByName(name);
}

module.exports = { create, findByName };
