var join = require('path').join;
var write = require('fs').writeFileSync;
var read = require('fs').readFileSync;
var mkdirp = require('mkdirp');
var request = require('request');
var s3Client = require('./s3-client');
var mongoClient = require('./mongo-client');
var navItemOrder = require('../client/helpers/navigation-item-order');

var dataDir = join(__dirname, '..', 'data');

importDataFromDrupal();

function importDataFromDrupal() {
  var client = s3Client();
  var db = mongoClient();

  request('http://www.rcsa.co.uk/rooms/data/stream?nodekey=3B3FDE2F8E2C46D0B222643015851A22', 
    function (err, res, body) {
      var allocations = JSON.parse(body.toString()).allocations;
      var allocationsOutput = {};
      mkdirp.sync(join(dataDir, 'allocations'));
      var remaining = allocations.length;
      allocations.forEach(function (allocation) {
        if (allocation.crsid) {
            var update = {};
            update['allocations.' + allocation.roomid] = allocation.crsid;
            db.allocations.update({year: +allocation.year}, {$set: update}, 
              {upsert: true}, function (err) {
                if (err) throw err;
                console.log('set ' + allocation.year + ' ' + allocation.roomid + ' = ' + allocation.crsid);
                if (0 === --remaining) return db.close();
              });
        }
      });
    });


  request('http://www.rcsa.co.uk/rooms/data/navigation', 
    function (err, res, body) {
      mkdirp.sync(dataDir);
      var navigation = JSON.parse(body.toString()).map(cleanSpec)
        .sort(navItemOrder);
      write(join(dataDir, 'navigation.json'),
        '[\n' + navigation.map(JSON.stringify).join(',\n').replace(/^/gm, '  ') + '\n]');
      upload('navigation.json');
      markdown();
    });

  function markdown() {
    mkdirp.sync(join(dataDir, 'markdown'));
    var navigation = JSON.parse(read(join(dataDir, 'navigation.json')).toString());
    navigation.forEach(function (item) {
      request('http://www.rcsa.co.uk/rooms/data/markdown?id=' + item.id, function (err, res, body) {
        if (body) body = JSON.parse(body.toString());
        if (body) {
          write(join(dataDir, 'markdown', (item.id || 'home') + '.md'), body);
          upload(join('markdown', (item.id || 'home') + '.md'));
        }
      });
    })
  }

  function cleanSpec(spec) {
    var i;
    var props = ['bathroomsharing', 'rentband', 'floor', 'weight', 'isgardenfacing'];
    for (i = 0; i < props.length; i++) {
      if (spec[props[i]] === null) {
        delete spec[props[i]];
      }
    }
    var nums = ['bathroomsharing', 'rentband', 'floor', 'weight'];
    for (i = 0; i < nums.length; i++) {
      if (spec[nums[i]]) {
        spec[nums[i]] = parseInt(spec[nums[i]], 10);
      }
    }
    if (spec.weight === 0) delete spec.weight;
    return spec;
  }

  function toError(resp, cb) {
    var body = '';
    var done = false;
    resp.on('error', function (e) {
      if (done) return;
      done = true;
      cb(e);
    });
    resp.on('data', function (data) {
      body += data.toString();
    });
    resp.on('end', function () {
      if (done) return;
      done = true;
      cb(new Error('S3 ' + resp.statusCode + ':\n' + body.replace(/^/gm, '  ')));
    });
  }

  function upload(path) {
    client.putFile(join(dataDir, path), path.replace(/\\/g, '/'), {}, function (err, resp) {
      if (err) {
        throw (err);
      } else if (resp.statusCode === 200) {
        console.log('upload ' + path);
      } else {
        toError(resp, function (err) {
          console.log('path: %j', path);
          throw (err);
        });
      }
    });
  }
}