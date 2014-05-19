var passport = require('passport');
var Raven = require('passport-raven');
var express = require('express');
var app = module.exports = express();

if (process.env.SKIP_AUTH === 'TRUE') {
  app.use(function (req, res, next) {
    req.user = {id: 'fpfl2', isAdmin: process.env.SKIP_AS_ADMIN === 'TRUE'};
    next();
  });
} else {
  passport.use(new Raven({
    audience: process.env.RAVEN_AUDIENCE || 'http://localhost:3000'
  }, function (crsid, callback) {
    callback(null, {
      id: crsid,
      isAdmin: crsid === 'meh65' ||
               crsid === 'fpfl2' ||
               crsid === 'dh464' ||
               crsid === 'sg604' ||
               crsid === 'rsa33'
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());



  app.get('/raven/login/:returnURI', function (req, res, next) {
    var returnURI = decodeURIComponent(req.params.returnURI);
    req.session.returnURI = returnURI;
    res.redirect('/raven/login');
  });
  app.get('/raven/login', passport.authenticate('raven'), function (req, res) {
    if (req.session.returnURI) {
      var returnURI = req.session.returnURI;
      delete req.session.returnURI;
      res.redirect('/' + returnURI);
    } else {
      res.redirect('/');
    }
  });
}