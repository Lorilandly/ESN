let express = require('express');
let router = express.Router();
let auth = require('./auth');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('join');
});

/* POST join page. */
router.post('/', async function (req, res, next) {
    const { username, password } = req.body;
    if (!auth.validateUsername(username)) {
        res.render('join', {
            errormsg: 'Please provide a different username',
        })
    } else if (!auth.validatePassword(password)) {
        res.render('join', {
            errormsg: 'Please provide a different password',
        })
    } else {
        res.render('join', {
            errormsg: '',
            username: username,
            password: password
        })
    }
});

module.exports = router;
