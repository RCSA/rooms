var join = require('path').join;
var fs = require('fs');
var s3Client = require('./s3-client')();
var mongoClient = require('./mongo-client')();

var isReady = false;
var waitingForReady = [];
var readyWaitingFor = 0;
exports.ready = function (fn) {
  if (isReady) fn();
  else waitingForReady.push(fn);
};
function setReady() {
  console.log('==ready==');
  if (isReady) return;
  isReady = true;
  for (var i = 0; i < waitingForReady.length; i++) {
    waitingForReady[i]();
  }
  waitingForReady = null;
  exports.ready = function (fn) { fn() };
};
function waitFor() {
  console.log('==start task==');
  readyWaitingFor++;
  return function () {
    console.log('==end task==');
    if (0 === --readyWaitingFor) setReady();
  };
}

require('./download-from-s3')(waitFor());

var markdown = exports.markdown = {};

markdown.read = function (key, callback) {

};
markdown.path = function (key, callback) {
  var path = join(__dirname, '..', 'data', 'markdown', (key || 'home') + '.md');
  fs.stat(path, function (err) {
    if (err) callback(err);
    else callback(null, path);
  })
};
markdown.update = function (key, content, callback) {
  var localPath = join(__dirname, '..', 'data', 'markdown', (key || 'home') + '.md');
  var serverPath = 'markdown/' + (key || 'home') + '.md';

  fs.writeFile(localPath, content, function (err) {
    if (err) return callback(err);
    s3Client.putFile(localPath, serverPath, uploaded);
  });
  function uploaded(err, result) {
    if (err) return callback(err);
    if (result && result.statusCode && result.statusCode != 200)
      return callback(new Error('server response code ' + result.statusCode));
    callback();
  }
};

var allocations = exports.allocations = {};

allocations.get = function (year, callback) {
  mongoClient.allocations.findOne({year: year}, function (err, res) {
    if (err) return callback(err);
    else callback(null, (res && res.allocations) || {});
  });
};

//{ year, roomid, crsid: name }
allocations.list = function (callback) {
  var current = (new Date()).getFullYear();
  var last = current - 1;
  var next = current + 1;
  var allocationsList = [];
  var pending = 3;
  getYear(last);
  getYear(current);
  getYear(next);
  function getYear(year) {
    allocations.get(year, function (err, res) {
      if (err) return callback(err);
      Object.keys(res)
        .forEach(function (room) {
          allocationsList.push({
            year: year,
            roomid: room,
            crsid: res[room]
          });
        });
      if (--pending === 0) return callback(null, allocationsList);
    })
  }
};

allocations.list.current = [];
var gotAlloctions = waitFor();
allocations.list(function (err, res) {
  if (err) throw err;
  allocations.list.current = res;
  gotAlloctions();
});

allocations.set = function (year, room, name, callback) {
  var update = {};
  update['allocations.' + room] = name;
  mongoClient.allocations.update({year: +year}, {$set: update}, 
    {upsert: true}, function (err) {
      if (err) return callback(err);

      //update memory cache
      var updated = false;
      allocations.list.current.forEach(function (allocation) {
        if (allocation.year === year && allocation.roomid === room) {
          allocation.crsid = name;
          updated = true;
        }
      });
      if (!updated) {
        allocations.list.current.push({
          year: year,
          roomid: room,
          crsid: name
        });
      }

      callback();
    });
};

var navigation = exports.navigation = {};
navigation.get = function (callback) {

};