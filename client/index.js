'use strict';

var page = require('page');
var request = require('then-request');
var React = require('react');
var Primus = require('./primus.js');
var collection = require('./data/collection');
var Application = require('./models/application.js');
var PageModel = require('./models/page.js');

var spark = new Primus();
var token = null;

var pages = collection('pages', {
  write: function (message) {
    message.token = token;
    spark.write(message);
  },
  on: spark.on.bind(spark)
});
var application = new Application(pages);

page('*', function (ctx, next) {
  application.setPathname(ctx.pathname);
  application.setQueryString({
    edit: ctx.querystring.indexOf('edit=true') !== -1
  });
  if (application.isLoaded() && !application.getPage()) {
    return next();
  }

  if (application.accessDenied() && !application.user.isAuthenticated) {
    return next();
  }
});
page.start();

request('/data/user').then(function (res) {
  var user = JSON.parse(res.getBody());
  token = user.token;
  application.setUser(user);
}).done();


application.subscribe(update);
function update() {
  if (application.isLoaded()) {
    React.renderComponent(application.render(), document.getElementById('page'));
  }
}
