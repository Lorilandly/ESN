let express = require('express');
let router = express.Router();
let userController = require('../controllers/user');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

/* POST home page. */
// TODO: rename to /users to be RESTful
router.post('/', userController.create, (req, res) => {
    res.render('welcome');
});

module.exports = router;
