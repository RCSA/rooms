var join = require('path').join;
var browserify = require('browserify-middleware');
var express = require('express');
var app = module.exports = express();

var isProduction = process.env.NODE_ENV === 'production';

app.get('/build/build.js', browserify('./client/index.js', {ignoreMissing: true}));
app.use(express.static(join(__dirname, 'files'), {
  maxAge: isProduction ? (10 * 60 * 1000) : 0
}));