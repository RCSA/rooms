'use strict';

var assert = require('assert');
var React = require('react');
var marked = require('marked');
var page = require('page');
var Page = require('./page.js');
var view = require('../view');

module.exports = Application;
function Application(pages) {
  var fullUpdate = function () {
    this._pages = pages.map(function (page) {
      return new Page(page);
    }).sort(function (a, b) {
      return a.compareTo(b);
    });
    this._isLoaded = pages.isLoaded;
    update();
  }.bind(this);
  var update = function () {
    var page = this.getPages().filter(function (page) {
      return page.getHref() === this.pathname;
    }.bind(this));
    if (page.length === 1) this._page = page[0];
    else this._page = null;

    if (this.isEditing() && this.getPage()) {
      this.editedMarkdown = this.editedMarkdown || this.getPage().getMarkdownBody();
    } else {
      this.editedMarkdown = null;
    }


    this.subscriptions.forEach(function (subscription) {
      subscription();
    });
  }.bind(this);

  this.setPathname = function (pathname) {
    this.pathname = pathname;
    update();
  };
  this.setQueryString = function (querystring) {
    this.querystring = querystring;
    update();
  };
  this.setUser = function (user) {
    this.user = user;
    update();
  };
  this.setEditingMarkdown = function (e) {
    this.editedMarkdown = e.target.value;
    update();
  };

  this.editedMarkdown = null;
  this.pathname = '/';
  this.querystring = {edit: false};
  this.user = {isAuthenticated: false, isAdmin: false};

  this.subscriptions = [];

  pages.subscribe(fullUpdate);
  fullUpdate();
}
Application.prototype.subscribe = function (fn) {
  assert(typeof fn === 'function');
  this.subscriptions.push(fn);
};
Application.prototype.render = function () {
  return view(this);
};
Application.prototype.renderAsString = function () {
  return React.renderComponentToString(view(this));
};
Application.prototype.isLoaded = function () {
  return this._isLoaded;
};
Application.prototype.accessDenied = function () {
  return this.querystring.edit && !this.user.isAuthenticated;
};
Application.prototype.getPages = function () {
  return this._pages;
};
Application.prototype.getPage = function () {
  return this._page;
};
Application.prototype.topLevelPages = function () {
  return this.getPages().filter(function (page) {
    return page.isTopLevel();
  });
};
Application.prototype.secondLevelPages = function () {
  return this.getPages().filter(function (page) {
    if (!this.getPage()) return false;
    return page.isSameSection(this.getPage());
  }.bind(this));
};
Application.prototype.isSelected = function (page) {
  if (page.getHref() === this.getPage().getHref()) return true;
  if (!this.getPage().isTopLevel() && page.isTopLevel() && this.getPage().isSameSection(page)) return true;
  return false;
};

Application.prototype.getCurrentYear = function () {
  var now = new Date();
  var year = now.getFullYear();
  return (now.getMonth() > 6) ? year : year - 1;
};
Application.prototype.getNextYear = function () {
  return this.getCurrentYear() + 1;
};

Application.prototype.isEditing = function () {
  return this.querystring.edit;
};
Application.prototype.getEditingMarkdown = function () {
  return this.editedMarkdown || '';
};
Application.prototype.getEditingPreview = function () {
  return marked(this.getEditingMarkdown());
};
Application.prototype.saveMarkdownBody = function () {
  this.getPage().data.set('body', this.getEditingMarkdown());
  page(location.pathname);
};
