let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* POST join page. */
router.post('/join', function(req, res, next) {
  const { username, password } = req.body;
  const message = `Join Successful: username=${username}, password=${password}`;
  res.send(message);
});

module.exports = router;