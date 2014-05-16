'use strict';

var assert = require('assert');
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
    pages = null;
    return res;
  });
};
exports.updatePageAllocation = function (id, year, name) {
  var update = {};
  update['allocations.' + year] = name;
  return db.pages.update({_id: id}, {'$set': update}).then(function (res) {
    assert(res.updatedExisting === true);
    assert(res.n === 1);
    pages = null;
    return res;
  });
};


exports.getPages = function () {
  return pages || (pages = db.pages.find().then());
};
exports.getPage = function (id) {
  return db.pages.findOne({_id: id});
};