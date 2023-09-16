let express = require('express');
let router = express.Router();
let User = require('../models/user').User;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* POST join page. */
router.post('/join', function(req, res, next) {
  const { username, password } = req.body;
  const message = `Join Successful: username=${username}, password=${password}`;
  const thisUser = new User(username, password, "SUPERDUPERADMIN", "DEAD");
  thisUser.insert();
  res.send(message);
});

module.exports = router;