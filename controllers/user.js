import { User } from '../models/user.js';
import { validateUsername, validatePassword } from '../routes/auth.js';

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

async function checkValidUsernamePassword(req, res, next) {
    const { username, password } = req.body;
    let msg;
    if (!validateUsername(username)) {
        msg = "bad username";
    }
    if (!validatePassword(password)) {
        msg = "bad password";
    }
    // TODO: This will be modified while fleshing out login/logout flows
    const user = await findByName(username);
    if (user) {
        if (!await checkPasswordForUser(username, password)) {
            msg = "username taken";
        } else {
            msg = "login";
        }
    }
    res.locals.data = { username, password, msg };
    next();
}

export { create, findByName, checkPasswordForUser, checkValidUsernamePassword };
