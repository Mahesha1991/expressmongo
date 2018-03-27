var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('erroruser', { errorMsg: "Please do not directly access" });
});

module.exports = router;
