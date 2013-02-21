var join = require('path').join;
var fs = require('fs');
var mkdirp = require('mkdirp');
var passport = require('passport');
var Raven = require('passport-raven');
var express = require('express');
var transform = require('transform');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {
  'log level': 2
});

mkdirp.sync(join(__dirname, 'data', 'markdown'));
mkdirp.sync(join(__dirname, 'data', 'allocations'));

var allocations = [];

var s3Client;

if (process.env.RCSA_S3_BUCKET) {
  console.log('DOWNLOAD FROM S3');
  require('./download-from-s3')({}, loadAllocations);
  s3Client = require('./s3-client')();
} else {
  console.log('NO DOWNLOAD FROM S3!!');
  loadAllocations();
}

function loadAllocations() {
  console.log('\n\n==Downloaded S3==\n\n');
  var currentYear = (new Date()).getFullYear();
  var lastYear = currentYear - 1;
  addYear(currentYear);
  addYear(lastYear);
  function addYear(year) {
    var current = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'allocations', year + '.json')).toString());
    Object.keys(current).forEach(function (roomid) {
      allocations.push({
        year: year,
        roomid: roomid,
        crsid: current[roomid]
      });
    });
  }
}

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
  var path = join(__dirname, 'data', 'markdown', (req.params.id || 'home') + '.md');
  fs.stat(path, function (err) {
    if (err) res.send('');
    else res.sendfile(path);
  })
});
app.post('/data/markdown/:id?', function (req, res, next) {
  if (!req.user) return res.send(403);
  var path = join(__dirname, 'data', 'markdown', (req.params.id || 'home') + '.md');
  fs.writeFile(path, req.body.content, function (err) {
    if (err) return next(err);
    s3Client.putFile(join(__dirname, 'data', 'markdown', (req.params.id || 'home') + '.md'),
      'markdown/' + (req.params.id || 'home') + '.md', uploaded);
  });
  function uploaded(err, result) {
    if (err) return next(err);
    if (result && result.statusCode && result.statusCode != 200)
      return next(new Error('server response code ' + result.statusCode));
    res.send('"updated"');
  }
});

app.post('/data/allocations', function (req, res, next) {
  if (!req.user || !req.user.isAdmin) return res.send(403);
  updateAllocation(req.body.year, req.body.roomid, req.body.crsid, function (err) {
    if (err) return next(err);
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
        allocations: allocations
      });
    }
  });
  socket.emit('authRequired');
});

function updateAllocation(year, roomid, crsid, callback) {
  var updated = false;
  var noop = false;

  allocations.forEach(function (allocation) {
    if (allocation.year === year && allocation.roomid === roomid) {
      if (allocation.crsid === crsid) {
        noop = true;
      } else {
        allocation.crsid = crsid;
        updated = true;
      }
    }
  });
  if (noop) return process.nextTick(callback);
  if (!updated) {
    allocations.push({
      year: year,
      roomid: roomid,
      crsid: crsid
    });
  }

  var current = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'allocations', year + '.json')).toString());
  if (crsid) {
    current[roomid] = crsid;
  } else {
    if (current[roomid]) 
      delete current[roomid];
  }
  fs.writeFileSync(join(__dirname, 'data', 'allocations', year + '.json'), JSON.stringify(current, null, 2));
  if (s3Client) {
    s3Client.putFile(join(__dirname, 'data', 'allocations', year + '.json'), 'allocations/' + year + '.json', uploaded);
  } else {
    process.nextTick(uploaded);
  }
  function uploaded(err, res) {
    if (err) return callback(err);
    if (res && res.statusCode && res.statusCode != 200)
      return callback(new Error('server response code ' + res.statusCode));
    io.sockets.in('authenticated').emit('message', {
      allocations: [
        {
          year: year,
          roomid: roomid,
          crsid: crsid
        }
      ]
    });
    callback();
  }
}

server.listen(3000);

/*
{"auth":{
  "isAuthenticated":true,
  "navigationEdit":false,
  "markdownEdit":true,
  "markdownSpecialEdit":false,
  "allocationsView":true,
  "allocationsEdit":false,
  "notificationKey":"3B3FDE2F8E2C46D0B222643015851A22"
},"changed":2235
*/