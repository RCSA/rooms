'use strict';

var Promise = require('promise');
var request = Promise.denodeify(require('request'));

var mongod = require('mongod');
var db = mongod(process.env.ROOMS_MONGO, ['pages']);

request('http://rooms.rcsa.co.uk/data/navigation').then(function (res) {
  if (res.statusCode !== 200) throw new Error('Status code ' + res.statusCode);
  return JSON.parse(res.body);
}).then(function (navigation) {
  return Promise.all(navigation.map(upsertItem));
}).then(function () {
  console.log('updated pages');
  return updateAllocations();
}).done(function () {
  console.log('updated allocations');
  db.close();
});

function upsertItem(item) {
  return request('http://rooms.rcsa.co.uk/data/markdown/' + item.id).then(function (res) {
    if (res.statusCode !== 200) throw new Error('Status code ' + res.statusCode);
    var body = res.body || '';
    item._id = item.id;
    delete item.id;
    item.body = body;
    if (item.type === 'room') {
      item.allocations = {};
    }
    return db.pages.update({_id: item._id}, item, {upsert: true});
  }).then(function (id) {
    console.log('update: ' + item._id);
  });
}

function updateAllocations() {
  return Promise.all([
    2012,
    2013,
    2014
  ].map(function (year) {
    console.log('updating: ' + year);
    return request('http://rooms.rcsa.co.uk/data/allocations/' + year + '.json').then(function (res) {
    if (res.statusCode !== 200) throw new Error('Status code ' + res.statusCode);
      var allocations = JSON.parse(res.body);
      return Promise.all(Object.keys(allocations).map(function (id) {
        var update = {};
        update['allocations.' + year] = allocations[id];
        return db.pages.update({_id: id}, {'$set': update});
      }));
    });
  }));
}