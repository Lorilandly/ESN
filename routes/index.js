let express = require("express");
let router = express.Router();
let userController = require('../controllers/user');

/* GET home page. */
router.get("/", function (req, res) {
    res.render("index");
});

module.exports = router;
