var join = require('path').join;
var transform = require('transform');
var express = require('express');
var app = module.exports = express();

var isProduction = process.env.NODE_ENV === 'production';
var doTransform = transform(join(__dirname, 'client'))
  .using(function (transform) {
    transform.add('component.json', 'build/build.js', [
      'component-js',
      {debug: !isProduction}
    ]);
    if (isProduction) {
      transform.add('.js', '.js', 'uglify-js');
    }
  })
  .grep(/^component.json$/);
if (isProduction) {
  doTransform.statically(join(__dirname, 'files'));
} else {
  app.use(doTransform.dynamically());
}

app.use(express.static(join(__dirname, 'files'), {
  maxAge: isProduction ? (10 * 60 * 1000) : 0
}));