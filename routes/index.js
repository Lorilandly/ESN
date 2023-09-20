let express = require('express');
let router = express.Router();
let userController = require('../controllers/user');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('respond with a home page');
});

/* POST home page. */
// TODO: rename to /users to be RESTful
router.post('/', userController.create);

module.exports = router;
