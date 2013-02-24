var store = require('./store');
var join = require('path').join;

var passport = require('passport');
var Raven = require('passport-raven');
var transform = require('transform');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {
  'log level': 2
});


app.use(function (req, res, next) {
  store.ready(next);
});

app.use(express.static(join(__dirname, 'static'), {maxAge: process.env.NODE_ENV === 'production' ? (5 * 60 * 1000) : 0}));
var transformed = transform(join(__dirname, 'client'))
  .using(function (transform) {
    transform.add('component.json', 'build/build.js', ['component-js', {debug: process.env.NODE_ENV != 'production'}]);
    if (process.env.NODE_ENV === 'production') {
      transform.add('.js', '.js', 'uglify-js');
    }
  })
  .grep(/^component.json$/)
  .to(join(__dirname, 'client'));
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'client'), {maxAge: (5 * 60 * 1000)}));
} else {
  app.use(transformed);
}

//app.use(express.logger('dev'));


passport.use(new Raven({
  audience: process.env.RAVEN_AUDIENCE || 'http://localhost:3000'
}, function (crsid, callback) {
  callback(null, {id: crsid, isAdmin: crsid === 'meh65' || crsid === 'fpfl2' || crsid === 'dh464'});
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));
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

app.get('/data/navigation', function (req, res) {
  res.sendfile(join(__dirname, 'data', 'navigation.json'));
});


app.get('/data/markdown/:id?', function (req, res) {
  store.markdown.path(req.params.id, function (err, path) {
    if (err) res.send('');
    else res.sendfile(path);
  })
});
app.post('/data/markdown/:id?', function (req, res, next) {
  store.markdown.update(req.params.id, req.body.content, function (err) {
    if (err) return next(err);
    else res.send('"updated"');
  })
});

app.post('/data/allocations', function (req, res, next) {
  if (!req.user || !req.user.isAdmin) return res.send(403);
  store.allocations.set(req.body.year, req.body.roomid, req.body.crsid, function (err) {
    if (err) return next(err);
    io.sockets.in('authenticated').emit('message', {
      allocations: [
        {
          year: year,
          roomid: roomid,
          crsid: crsid
        }
      ]
    });
    res.send('"updated"');
  })
});

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

io.sockets.on('connection', function (socket) {
  socket.on('auth', function (key, callback) {
    if (key === "3B3FDE2F8E2C46D0B222643015851A22") {
      socket.join('authenticated');
      callback({
        allocations: store.allocations.list.current
      });
    }
  });
  socket.emit('authRequired');
});

server.listen(3000);