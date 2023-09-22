import { User } from '../models/user.js';

function create(req, res, next) {
    const { username, password } = req.body;
    const message = `Join Successful: username=${username}, password=${password}`;
    User.create(username.toLowerCase(), password, "DEAD", "SUPERDUPERADMIN");
    next();
}

async function checkPasswordForUser(username, password) {
    return await User.checkPasswordForUser(username, password);
}

async function findByName(name) {
	return await User.findByName(name.toLowerCase());
}

export { create, findByName, checkPasswordForUser };
