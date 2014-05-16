'use strict';

var browserify = require('browserify-middleware');
var express = require('express');
var store = require('./store');
var compileReact = require('./react-compiler.js');

var app = express();

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));

app.use(require('./raven/server.js'));

app.get('/data/user', function (req, res, next) {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    isAdmin: req.isAuthenticated() && req.user.isAdmin
  });
});
app.get('/data/pages', function (req, res, next) {
  store.getPages().done(function (navigation) {
    res.json(navigation);
  }, next);
});
app.post('/data/pages/body', function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.send(403);
  }
  var id = req.body.id;
  var body = req.body.body;
  store.updatePageBody(id, body, req.user.isAdmin).done(function (result) {
    res.send(200);
  }, next);
});
app.get('/build/build.js', browserify(__dirname + '/client/index.js', {
  transform: [require('jadeify')]
}));
if (process.env.NODE_ENV !== 'production') {
  app.use(function (req, res, next) {
    compileReact();
    next();
  });
}
app.use(function (req, res, next) {
  if (req.query.edit && !req.isAuthenticated()) {
    req.session.returnURI = req.uri;
    return res.redirect('/raven/login');
  }
  store.getPage(req.path).done(function (page) {
    if (!page) return next();
    res.sendfile(__dirname + '/static/index.html');
  }, next);
});
app.use(express.static(__dirname + '/static', {
  maxAge: process.env.NODE_ENV === 'production' ? (10 * 60 * 1000) : 0
}));

app.listen(3000);