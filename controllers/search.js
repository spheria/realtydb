// var User = require('../models/User');
var Unit = require('../models/Unit');

/**
* POST /signup
*/
exports.searchUnit = function(req, res, next) {
  if (req.params.q) {
    Unit.fetch().then(function(units) {
      // res.redirect('/account');
      res.status(200).send({error:0, data:units});
    }).catch(function(err) {
      if (err) {
        res.status(500).send({error:1, msg:"DB error"});
      }
    });
  } else {
      res.status(400).send({error:1, msg:"Your keyword is invalid" });
    }

  };
