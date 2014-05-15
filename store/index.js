'use strict';

var mongod = require('mongod');
var db = mongod(process.env.ROOMS_MONGO, ['pages']);

exports.updatePageBody = function (id, body) {
  return db.pages.update({_id: id}, {'$set': {body: body}});
};
exports.updatePageAllocation = function (id, year, name) {
  var update = {};
  update['allocations.' + year] = name;
  return db.pages.update({_id: id}, {'$set': update});
};
exports.getPages = function () {
  return db.pages.find();
};