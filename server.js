var store = require('./store');
var join = require('path').join;

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {
  'log level': 2
});


app.use(function (req, res, next) {
  store.ready(next);
});

app.use(require('./static'));

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));

app.use(require('./raven'));

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
          year: req.body.year,
          roomid: req.body.roomid,
          crsid: req.body.crsid
        }
      ]
    });
    res.send('"updated"');
  })
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