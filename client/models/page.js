'use strict';

var marked = require('marked');
var request = require('then-request');
var page = require('page');

var RENT_BANDS = ["Unavailable to Students", "Value", "Standard", "Standard Plus", "Best"];

var FLOORS = [
  "Ground Floor", "First Floor", "Second Floor", "Third Floor",
  "Fourth Floor", "Fith Floor", "Sixth Floor"
];
FLOORS[-1] = "Basement";

module.exports = Page;
function Page(data){
  this.data = data;
}

Page.prototype.compareTo = function (other) {
  if (this.data.weight !== other.data.weight) {
    if (!other.data.weight) return this.data.weight;
    if (!this.data.weight) return -other.data.weight;
    return this.data.weight - other.data.weight;
  }
  if (this.data.floor !== undefined &&other.data.floor !== undefined && this.data.floor !== other.data.floor) {
    return this.data.floor - other.data.floor;
  }
  
  var aNum = this.data._id.match(/([0-9]+)[^\/]*$/);
  var bNum = other.data._id.match(/([0-9]+)[^\/]*$/);
  if (aNum && bNum) {
    var diff = (+aNum[1] - +bNum[1]) || this.data._id.length - other.data._id.length;
    if (diff) return diff;
  }
  if (this.data._id > other.data._id) {
    return 1;
  } else if (this.data._id < other.data._id) {
    return -1;
  }

  return 0;
};

Page.prototype.isTopLevel = function () {
  return this.data.parentid === 'Root';
};
Page.prototype.isSameSection = function (parent) {
  return parent.isTopLevel() ?
    this.data.parentid === parent.data._id :
    this.data.parentid === parent.data.parentid;
};
Page.prototype.getHref = function () {
  return this.data._id;
};
Page.prototype.getName = function () {
  return this.data.name;
};
Page.prototype.getHtmlBody = function () {
  return this.data.body ? marked(this.data.body) : 'This page has no content.';
};
Page.prototype.getMarkdownBody = function () {
  return this.data.body;
};
Page.prototype.setMarkdownBody = function (e) {
  if (this.data.oldBody === undefined) this.data.oldBody = this.data.body || '';
  this.data.body = e.target.value;
  page.show(location.pathname + location.search);
};
Page.prototype.saveMarkdownBody = function () {
  if (this.data.body === this.data.oldBody || this.data.oldBody === undefined) {
    this.data.oldBody = undefined;
    return page(location.pathname);
  }
  request('/data/pages/body', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({id: this.data._id, body: this.data.body})
  }).then(function (res) {
    //check for success
    res.getBody();
  }).done(function () {
    this.data.oldBody = undefined;
    page(location.pathname);
  }.bind(this), function (err) {
    alert('There was an error saving this page');
  });
};
Page.prototype.setAllocation = function (year, e) {
  this.data.allocations[year] = e.target.value;
  page.show(location.pathname + location.search);
};


Page.prototype.isRoom = function () {
  return this.data.type === 'room';
};
Page.prototype.getBathroomDescription = function () {
  switch (this.data.bathroomsharing) {
    case 0:
      return null;
    case 1:
      return "Ensuite";
    default:
      return "Shared between " + this.data.bathroomsharing + " people";
  }
};
Page.prototype.getRentBandDescription = function () {
  return RENT_BANDS[this.data.rentband] || this.data.rentband;
};
Page.prototype.getFloorDescription = function () {
  return FLOORS[this.data.floor] || "Floor " + this.data.floor;
};

Page.prototype.getCurrentYearAllocation = function () {
  var now = new Date();
  var year = now.getFullYear() - 1;
  if (now.getMonth() > 6) year++;
  return this.data.allocations[year];
};
Page.prototype.getNextYearAllocation = function () {
  var now = new Date();
  var year = now.getFullYear();
  if (now.getMonth() > 6) year++;
  return this.data.allocations[year];
};

Page.prototype.requiresLogin = function () {
  return this.requiresAdmin() || ['/projector'].indexOf(this.data._id) !== -1;
};
Page.prototype.requiresAdmin = function () {
  return ['/allocationEdit'].indexOf(this.data._id) !== -1;
};