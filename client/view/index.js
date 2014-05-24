'use strict';

var jade = require('react-jade');
var view = jade.compileFile(__dirname + '/index.jade');

module.exports = function (app) {
  return view({app: app});
};
