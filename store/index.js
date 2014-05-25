'use strict';

var assert = require('assert');
var Promise = require('promise');
var mongod = require('mongod');
var db = mongod(process.env.ROOMS_MONGO, ['pages']);

var pages = null;

exports.updatePageBody = function (id, body, isAdmin) {
  var query = isAdmin ? {_id: id} : {
    $or: [
      {_id: id, type: 'room'},
      {_id: id, type: 'staircase'}
    ]
  };
  return db.pages.update(query, {'$set': {body: body}}).then(function (res) {
    assert(res.updatedExisting === true);
    assert(res.n === 1);
    return res;
  });
};
exports.updatePageAllocation = function (id, year, name) {
  var update = {};
  update['allocations.' + year] = name;
  return db.pages.update({_id: id}, {'$set': update}).then(function (res) {
    assert(res.updatedExisting === true);
    assert(res.n === 1);
    return res;
  });
};
exports.updatePage = function (id, update) {
  return db.pages.update({_id: id}, {'$set': update}).then(function (res) {
    assert(res.updatedExisting === true);
    assert(res.n === 1);
    return res;
  });
};


exports.getPages = function () {
  return db.pages.find().then(function (res) {
    return res;
  }, function (err) {
    console.error(err.stack);
    return p;
  });
};
exports.getPage = function (id) {
  return exports.getPages().then(function (pages) {
    pages = pages.filter(function (page) {
      return page._id === id;
    });
    return pages.length === 1 ? pages[0] : null;
  });
};
