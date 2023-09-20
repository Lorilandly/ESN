let User = require("../models/user").User;
let UserModel = new User();

function create(username, password) {
	UserModel.create(username, password, "SUPERDUPERADMIN", "DEAD");
}

async function findByName(name) {
	return await UserModel.findByName(name);
}

module.exports = { create, findByName };
