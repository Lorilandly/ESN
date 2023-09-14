const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    const { username, password } = req.query;
    const message = `Login Successful: username=${username}, password=${password}`;
    res.send(message);
});

module.exports = router;