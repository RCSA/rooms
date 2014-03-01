var passport = require('passport');
var Raven = require('passport-raven');
var express = require('express');
var app = module.exports = express();

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
})



var anonymousUser = JSON.stringify({
  auth:{
    isAuthenticated:false,
    navigationEdit:false,
    markdownEdit:false,
    markdownSpecialEdit:false,
    allocationsView:false,
    allocationsEdit:false
  }
});
var adminUser = JSON.stringify({
  auth:{
    isAuthenticated:true,
    navigationEdit:true,
    markdownEdit:true,
    markdownSpecialEdit:true,
    allocationsView:true,
    allocationsEdit:true,
    notificationKey:"3B3FDE2F8E2C46D0B222643015851A22"
  }
});
var normalUser = JSON.stringify({
  auth:{
    isAuthenticated:true,
    navigationEdit:false,
    markdownEdit:true,
    markdownSpecialEdit:false,
    allocationsView:true,
    allocationsEdit:false,
    notificationKey:"3B3FDE2F8E2C46D0B222643015851A22"
  }
});
app.get('/data/stream', function (req, res) {
  if (req.user && req.user.isAdmin) {
    res.send(req.query.auth === 'true' ? '{}' : adminUser);
  } else if (req.user) {
    res.send(req.query.auth === 'true' ? '{}' : normalUser);
  } else {
    res.send(req.query.auth === 'false' ? '{}' : anonymousUser);
  }
});