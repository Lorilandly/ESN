let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    // Redirect to "/login" if not logged in
    res.render('welcome');
});

module.exports = router;

