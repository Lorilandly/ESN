let express = require('express');
let router = express.Router();
let auth = require('./auth');
let userController = require('../controllers/user');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

/* POST join page. */
router.post('/join', async function (req, res, next) {
    const { username, password } = req.body;
    if (!auth.validateUsername(username)) {
        res.render('index', {
            errormsg: 'Please provide a different username',
        })
    } else if (!auth.validatePassword(password)) {
        res.render('index', {
            errormsg: 'Please provide a different password',
        })
    } else {
        res.render('index', {
            errormsg: '',
            username: username,
            password: password
        })
    }
});

/* POST home page. */
// TODO: rename to /users to be RESTful
router.post('/home', userController.create);

module.exports = router;