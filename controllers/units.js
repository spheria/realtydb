var User = require('../models/User');
var Unit = require('../models/Unit');

/**
 * POST /signup
 */
exports.saveUnit = function(req, res, next) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('model', 'Model cannot be blank').notEmpty();
  req.assert('developer', 'Developer cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  new User({
    name: req.body.name,
    model: req.body.model,
    developer: req.body.developer,
    pagibig_dp_terms: req.body.pagibig_dp_terms || null,
    pagibig_dp_percent: req.body.pagibig_dp_percent || null,
    bank_dp_terms: req.body.bank_dp_terms || null,
    bank_dp_percent: req.body.bank_dp_percent || null,
    bank_affiliate: req.body.bank_affiliate || null,
    property_type: req.body.property_type || null,
    google_map_link: req.body.google_map_link || null,
    bedroom_count: req.body.bedroom_count || null,
    bathroom_count: req.body.bathroom_count || null,
    date_of_release: req.body.date_of_release || null,
  }).save()
    .then(function(data) {
        console.log(data);
        res.json({error:0, msg:"Unit saved."});
    })
    .catch(function(err) {
      if (err) {
          return res.status(400).send({ msg: 'Data was not saved.' });
      }
      // if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
      //   return res.status(400).send({ msg: 'The email address you have entered is already associated with another unit.' });
      // }
    });
};


/**
 * PUT /unit
 * Update profile information OR change password.
 */
exports.unitPut = function(req, res, next) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('model', 'Model cannot be blank').notEmpty();
  req.assert('developer', 'Developer cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  // var user = new User({ id: req.user.id });
  if ('password' in req.body) {
    user.save({
      password: req.body.password
    }, { patch: true });
  } else {
    user.save({
      email: req.body.email,
      name: req.body.name,
      gender: req.body.gender,
      location: req.body.location,
      website: req.body.website
    }, { patch: true });
  }
  // user.fetch().then(function(user) {
  //   if ('password' in req.body) {
  //     res.send({ msg: 'Your password has been changed.' });
  //   } else {
  //     res.send({ user: user, msg: 'Your profile information has been updated.' });
  //   }
  //   res.redirect('/unit');
  // }).catch(function(err) {
  //   if (err.code === 'ER_DUP_ENTRY') {
  //     res.status(409).send({ msg: 'The email address you have entered is already associated with another unit.' });
  //   }
  // });
};

/**
 * DELETE /unit
 */
exports.unitDelete = function(req, res, next) {
  new User({ id: req.user.id }).destroy().then(function(user) {
    res.send({ msg: 'Your unit has been permanently deleted.' });
  });
};

/**
 * GET /unlink/:provider
 */
exports.unlink = function(req, res, next) {
  new User({ id: req.user.id })
    .fetch()
    .then(function(user) {
      switch (req.params.provider) {
        case 'facebook':
          user.set('facebook', null);
          break;
        case 'google':
          user.set('google', null);
          break;
        case 'twitter':
          user.set('twitter', null);
          break;
        case 'vk':
          user.set('vk', null);
          break;
        default:
        return res.status(400).send({ msg: 'Invalid OAuth Provider' });
      }
      user.save(user.changed, { patch: true }).then(function() {
      res.send({ msg: 'Your unit has been unlinked.' });
      });
    });
};

/**
 * POST /forgot
 */
exports.forgotPost = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      new User({ email: req.body.email })
        .fetch()
        .then(function(user) {
          if (!user) {
        return res.status(400).send({ msg: 'The email address ' + req.body.email + ' is not associated with any unit.' });
          }
          user.set('passwordResetToken', token);
          user.set('passwordResetExpires', new Date(Date.now() + 3600000)); // expire in 1 hour
          user.save(user.changed, { patch: true }).then(function() {
            done(null, token, user.toJSON());
          });
        });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'support@yourdomain.com',
        subject: '✔ Reset your password on Mega Boilerplate',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your unit.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        res.send({ msg: 'An email has been sent to ' + user.email + ' with further instructions.' });
        done(err);
      });
    }
  ]);
};

/**
 * POST /reset
 */
exports.resetPost = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirm', 'Passwords must match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
      return res.status(400).send(errors);
  }

  async.waterfall([
    function(done) {
      new User({ passwordResetToken: req.params.token })
        .where('passwordResetExpires', '>', new Date())
        .fetch()
        .then(function(user) {
          if (!user) {
          return res.status(400).send({ msg: 'Password reset token is invalid or has expired.' });
          }
          user.set('password', req.body.password);
          user.set('passwordResetToken', null);
          user.set('passwordResetExpires', null);
          user.save(user.changed, { patch: true }).then(function() {
          done(err, user.toJSON());
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
      var mailOptions = {
        from: 'support@yourdomain.com',
        to: user.email,
        subject: 'Your Mega Boilerplate password has been changed',
        text: 'Hello,\n\n' +
        'This is a confirmation that the password for your unit ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        res.send({ msg: 'Your password has been changed successfully.' });
      });
    }
  ]);
};
