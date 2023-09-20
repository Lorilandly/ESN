let express = require('express');
let router = express.Router();
let userController = require('../controllers/user');

/* POST new user */
router.post('/', userController.create, function(req, res, next) {
    res.redirect("welcome");
});

module.exports = router;
