'use strict';

var assert = require('assert');
var http = require('http');
var fs = require('fs');
var browserify = require('browserify-middleware');
var express = require('express');
var Primus = require('primus');
var jwt = require('jsonwebtoken');
var store = require('./store');


var COOKIE_SECRET = process.env.COOKIE_SECRET;
var clients = [];
var app = express();

app.set('views', __dirname);

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: COOKIE_SECRET }));

app.use(require('./raven/server.js'));

app.get('/data/user', function (req, res, next) {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    isAdmin: req.isAuthenticated() && req.user.isAdmin,
    token: req.isAuthenticated() ? jwt.sign(req.user, process.env.TOKEN_SECRET) : null
  });
});

if (process.env.DISABLE_JAVASCRIPT === 'true') {
  app.get('/build/build.js', function (req, res) {
    res.end('');
  });
} else {
  browserify.settings.development('cache', false);
  app.get('/build/build.js', browserify(__dirname + '/client/index.js', {
    transform: [require('react-jade')]
  }));
}

var ApplicationModel = require('./client/models/application.js');
var collection = require('./client/data/collection.js');
var pipe = (function () {
  var client = {};
  var server = {};
  var clientHandlers = [];
  var serverHandlers = [];
  client.on = function (name, fn) {
    assert(typeof name === 'string');
    assert(typeof fn === 'function');
    if (name === 'data') {
      clientHandlers.push(fn);
    }
  };
  server.on = function (name, fn) {
    assert(typeof name === 'string');
    assert(typeof fn === 'function');
    if (name === 'data') {
      serverHandlers.push(fn);
    }
  };
  client.write = function (message) {
    setTimeout(function () {
      serverHandlers.forEach(function (fn) {
        fn(message);
      });
    }, 0);
  };
  server.write = function (message) {
    setTimeout(function () {
      clientHandlers.forEach(function (fn) {
        fn(message);
      });
    }, 0);
  };
  return {client: client, server: server};
}());
var application = new ApplicationModel(collection('pages', pipe.client));
onConnection(pipe.server);

app.use(function (req, res, next) {
  if (req.query.edit && !req.isAuthenticated()) {
    req.session.returnURI = req.uri;
    return res.redirect('/raven/login');
  }
  application.setUser({
    isAuthenticated: req.isAuthenticated(),
    isAdmin: req.isAuthenticated() && req.user.isAdmin
  });
  application.setPathname(req.path);
  if (application.getPage()) {
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

var server = http.createServer(app);
var primus = new Primus(server, {transformer: 'engine.io'});
primus.on('connection', onConnection);
function onConnection(spark) {
  clients.push(spark);
  spark.on('data', function (message) {
    if (message.action === 'read') {
      return store.getPages().done(function (pages) {
        pages.forEach(function (page) {
          var page = JSON.parse(JSON.stringify(page));
          page.id = page._id;
          delete page._id;
          spark.write({
            collection: 'pages',
            id: page.id,
            action: 'insert',
            properties: page
          });
        });
        spark.write({
          collection: 'pages',
          action: 'ready',
          id: '',
          properties: {}
        });
      });
    } else {
      if (!message.token) return;
      jwt.verify(message.token, process.env.TOKEN_SECRET, function (err, user) {
        if (err) {
          console.error(err.stack || err);
          return;
        }
        if (!user) return;
        switch (message.action) {
          case 'update':
            if (!user.isAdmin && (Object.keys(message.properties).length !== 1 || Object.keys(message.properties)[0] !== 'body')) {
              return;
            } else {
              store.updatePage(message.id, message.properties);
              for (var i = 0; i < clients.length; i++) {
                clients[i].write(message);
              }
            }
            break;
        }
      });
    }
  });
  spark.on('end', function () {
    clients = clients.filter(function (s) { return s !== spark; });
  });
}

fs.writeFileSync(__dirname + '/client/primus.js', require('derequire')(primus.library()));
server.listen(3000);
