'use strict';

var mongod = require('mongod');
var db = mongod(process.env.ROOMS_MONGO, [
  'markdown',
  'allocations',
  'navigation'
]);


var markdown = exports.markdown = {};

markdown.read = function (key) {
  return db.markdown.findOne({_id: key}).then(function (res) {
    return (res && res.body) || '';
  });
};
markdown.update = function (key, content, callback) {
  return db.markdown.update({_id: key}, {_id: id, body: content}, {upsert: true});
};

var allocations = exports.allocations = {};

allocations.get = function (year, callback) {
  return db.allocations.findOne({year: +year}).then(function (res) {
    return (res && res.allocations) || {};
  });
};

// return a list of the form { year, roomid, crsid: name }
// for all the time span the client may be interested in
allocations.list = function () {
  var current = (new Date()).getFullYear();
  var last = current - 1;
  var next = current + 1;
  return Promise.all([
    allocations.get(last),
    allocations.get(current),
    allocations.get(next)
  ]).then(function (allocations) {
    return allocations.map(function (obj) {
      return Object.keys(obj).map(function (room) {
        return {
          year: year,
          roomid: room,
          crsid: res[room]
        };
      });
    }).reduce(function (a, b) {
      return a.concat(b);
    }, []);
  });
};

allocations.set = function (year, room, name) {
  var update = {};
  update['allocations.' + room] = name;
  return db.allocations.update({year: +year}, {$set: update}, {upsert: true});
};

var navigation = exports.navigation = {};
navigation.get = function () {
  return db.navigation.find();
};