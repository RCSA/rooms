var join = require('path').join;
var write = require('fs').writeFileSync;
var read = require('fs').readFileSync;
var mkdirp = require('mkdirp');
var request = require('request');
var s3Client = require('./s3-client');

var knox = require('knox');

module.exports = importDataFromDrupal;
function importDataFromDrupal(settings) {
  var client = s3Client(settings);

  request('http://www.rcsa.co.uk/rooms/data/stream?nodekey=3B3FDE2F8E2C46D0B222643015851A22', 
    function (err, res, body) {
      var allocations = JSON.parse(body.toString()).allocations;
      var allocationsOutput = {};
      mkdirp.sync(join(__dirname, 'data', 'allocations'));
      allocations.forEach(function (allocation) {
        if (allocation.crsid) {
          allocationsOutput[allocation.year] = allocationsOutput[allocation.year] || {};
          allocationsOutput[allocation.year][allocation.roomid] = allocation.crsid.replace(/\t/g, ' ');
        }
      });
      Object.keys(allocationsOutput)
        .forEach(function (year) {
          write(join(__dirname, 'data', 'allocations', year + '.json'),
            JSON.stringify(allocationsOutput[year], null, 2));
          upload(join('allocations', year + '.json'))
        });
    });

  request('http://www.rcsa.co.uk/rooms/data/navigation', 
    function (err, res, body) {
      mkdirp.sync(join(__dirname, 'data'));
      var navigation = JSON.parse(body.toString()).map(cleanSpec)
        .sort(require('./client/helpers/navigation-item-order'))
        .filter(function (item) {
          return item.id != 'navigationTableEdit';
        });
      write(join(__dirname, 'data', 'navigation.json'),
        '[\n' + navigation.map(JSON.stringify).join(',\n').replace(/^/gm, '  ') + '\n]');
      upload('navigation.json');
      markdown();
    });

  function markdown() {
    mkdirp.sync(join(__dirname, 'data', 'markdown'));
    var navigation = JSON.parse(read(join(__dirname, 'data', 'navigation.json')).toString());
    navigation.forEach(function (item) {
      request('http://www.rcsa.co.uk/rooms/data/markdown?id=' + item.id, function (err, res, body) {
        if (body) body = JSON.parse(body.toString());
        if (body) {
          write(join(__dirname, 'data', 'markdown', (item.id || 'home') + '.md'), body);
          upload(join('markdown', (item.id || 'home') + '.md'));
        }
      });
    })
  }

  function cleanSpec(spec) {
    var i;
    var props = ['bathroomsharing', 'rentband', 'floor', 'isgardenfacing'];
    for (i = 0; i < props.length; i++) {
      if (spec[props[i]] === null) {
        delete spec[props[i]];
      }
    }
    var nums = ['bathroomsharing', 'rentband', 'floor'];
    for (i = 0; i < nums.length; i++) {
      if (spec[nums[i]]) {
        spec[nums[i]] = parseInt(spec[nums[i]], 10);
      }
    }
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
    client.putFile(join(__dirname, 'data', path), path.replace(/\\/g, '/'), {}, function (err, resp) {
      if (err) {
        throw (err);
      } else if (resp.statusCode === 200) {

      } else {
        toError(resp, function (err) {
          console.log('path: %j', path);
          throw (err);
        });
      }
    });
  }
}