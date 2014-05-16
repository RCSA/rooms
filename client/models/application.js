'use strict';

module.exports = Application;
function Application() {
  this.loading = true;
  this.pages = [];
  this.currentPage = null;
  this.editMode = false;
  this.user = {isAuthenticated: false, isAdmin: false};
}
Application.prototype.topLevelPages = function () {
  return this.pages.filter(function (page) {
    return page.isTopLevel();
  });
};
Application.prototype.secondLevelPages = function () {
  return this.pages.filter(function (page) {
    if (!this.currentPage) return false;
    return page.isSameSection(this.currentPage);
  }.bind(this));
};
Application.prototype.isSelected = function (page) {
  if (page === this.currentPage) return true;
  if (!this.currentPage.isTopLevel() && page.isTopLevel() && this.currentPage.isSameSection(page)) return true;
  return false;
};