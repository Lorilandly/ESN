let User = require('../models/user').User;

function create(req, res, next) {
    const { username, password } = req.body;
    const message = `Join Successful: username=${username}, password=${password}`;
    const newUser = new User(username, password, "SUPERDUPERADMIN", "DEAD");
    newUser.insert();
    res.send(message);
}

module.exports = { create };