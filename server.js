'use strict';

var browserify = require('browserify-middleware');
var express = require('express');
var store = require('./store');

var app = express();

app.set('views', __dirname);

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
  transform: [require('react-jade')]
}));


var ApplicationModel = require('./client/models/application.js');
var PageModel = require('./client/models/page.js');
var application = new ApplicationModel();

store.getPages().done(function (navigation) {
  application.loading = false;
  application.pages = navigation.map(function (page) {
    return new PageModel(page);
  });
});

app.use(function (req, res, next) {
  if (req.query.edit && !req.isAuthenticated()) {
    req.session.returnURI = req.uri;
    return res.redirect('/raven/login');
  }
  application.user = {
    isAuthenticated: req.isAuthenticated(),
    isAdmin: req.isAuthenticated() && req.user.isAdmin
  };
  application.currentPage = application.pages.filter(function (page) {
    return page.getHref() === req.path;
  })[0];
  if (application.currentPage) {
    res.render('view.jade', {application: application});
    return;
  }
  store.getPage(req.path).done(function (page) {
    if (!page) return next();
    res.render('view.jade', {application: false});
  }, next);
});
app.use(express.static(__dirname + '/static', {
  maxAge: process.env.NODE_ENV === 'production' ? (10 * 60 * 1000) : 0
}));

app.listen(3000);