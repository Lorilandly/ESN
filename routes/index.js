let express = require('express');
let router = express.Router();
let userController = require('../controllers/user');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('This is a home page. You will be redirected if you are not logged in');
});

/* POST home page. */
// TODO: rename to /users to be RESTful
router.post('/', userController.create);

module.exports = router;
