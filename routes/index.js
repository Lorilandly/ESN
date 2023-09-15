let express = require('express');
let router = express.Router();
let auth = require('./auth');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

/* POST join page. */
router.post('/join', function (req, res, next) {
  const { username, password } = req.body;
  if (!auth.validateUsername(username)) {
    res.render('index', {
      errormsg: "Please provide a different username"
    })
  } else if (!auth.validatePassword(password)) {
    res.render('index', {
      errormsg: "Please provide a different password"
    })
  } else {
    const message = `Join Successful: username=${username}, password=${password}`;
    res.send(message);
  }
});

module.exports = router;