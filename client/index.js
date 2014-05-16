'use strict';

var page = require('page');
var request = require('then-request');
var React = require('react');
var Application = require('./models/application.js');
var PageModel = require('./models/page.js');
var view = require('./view.js');

var application = new Application();

page('*', function (ctx, next) {
  var matches = application.pages.filter(function (page) {
    return ctx.pathname === page.getHref();
  });
  if (matches.length !== 1) {
    return next();
  }
  application.currentPage = matches[0];
  application.editMode = ctx.querystring.indexOf('edit') !== -1;
  
  if (application.editMode && !application.user.isAuthenticated) {
    return next();
  }
  React.renderComponent(view(application), document.getElementById('page'));
});
page.start();

update();

request('/data/pages').then(function (res) {
  if (window.localStorage) {
    window.localStorage.setItem('pages', res.getBody());
  }
  gotData(res.getBody());
}).done();
request('/data/user').then(function (res) {
  application.user = JSON.parse(res.getBody());
  update();
}).done();

if (window.localStorage && window.localStorage.getItem('pages')) {
  gotData(window.localStorage.getItem('pages'));
}

function gotData(str) {
  application.loading = false;
  application.pages = JSON.parse(str).map(function (page) {
    return new PageModel(page);
  }).sort(function (a, b) {
    return a.compareTo(b);
  });
  update();
}

function update() {
  page.show(location.pathname + location.search);
}