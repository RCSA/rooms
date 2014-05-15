var store = require('./store');
var join = require('path').join;

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {
  'log level': 2
});


app.use(require('./static'));

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));

app.use(require('./raven/server.js'));

app.get('/data/navigation', function (req, res, next) {
  store.getPages().done(function (navigation) {
    res.json(navigation);
  }, next);
});


app.get('/data/markdown/:id?', function (req, res, next) {
  store.markdown.read(req.params.id || '').then(function (body) {
    res.send(body || '');
  }).done(null, next);
});
app.post('/data/markdown/:id?', function (req, res, next) {
  store.updagePageBody(req.params.id || '', req.body.content).done(function () {
    res.send('"updated"');
  }, next);
});

app.post('/data/allocations', function (req, res, next) {
  if (!req.user || !req.user.isAdmin) return res.send(403);
  store.allocations.set(req.body.year, req.body.roomid, req.body.crsid).then(function () {
    io.sockets.in('authenticated').emit('message', {
      allocations: [
        {
          year: req.body.year,
          roomid: req.body.roomid,
          crsid: req.body.crsid
        }
      ]
    });
    res.send('"updated"');
  }).done(null, next);
});

app.get('/data/allocations/:year.json', function (req, res, next) {
  store.allocations.get(req.params.year).done(function (result) {
    res.json(result);
  }, next);
});

io.sockets.on('connection', function (socket) {
  socket.on('auth', function (key, callback) {
    if (key === "3B3FDE2F8E2C46D0B222643015851A22") {
      socket.join('authenticated');
    }
  });
  socket.emit('authRequired');
});

server.listen(3000);