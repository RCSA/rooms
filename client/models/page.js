'use strict';

var marked = require('marked');
var request = require('then-request');

var RENT_BANDS = ["Unavailable to Students", "Value", "Standard", "Standard Plus", "Best"];

var FLOORS = [
  "Ground Floor", "First Floor", "Second Floor", "Third Floor",
  "Fourth Floor", "Fith Floor", "Sixth Floor"
];
FLOORS[-1] = "Basement";

module.exports = Page;
function Page(data){
  this.data = data;
  this.data.facing = this.data.facing || 'unknown';
  this.posts = {};
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

  var aNum = this.data.id.match(/([0-9]+)[^\/]*$/);
  var bNum = other.data.id.match(/([0-9]+)[^\/]*$/);
  if (aNum && bNum) {
    var diff = (+aNum[1] - +bNum[1]) || this.data.id.length - other.data.id.length;
    if (diff) return diff;
  }
  if (this.data.id > other.data.id) {
    return 1;
  } else if (this.data.id < other.data.id) {
    return -1;
  }

  return 0;
};

Page.prototype.getParent = function () {
  return this.data.parentid;
};
Page.prototype.isTopLevel = function () {
  return this.data.parentid === 'Root';
};
Page.prototype.isSameSection = function (parent) {
  return parent.isTopLevel() ?
    this.data.parentid === parent.data.id :
    this.data.parentid === parent.data.parentid;
};
Page.prototype.getHref = function () {
  return this.data.id;
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
Page.prototype.setProperty = function (name, e) {
  var value = typeof this.data[name] === 'number' ? +e.target.value : e.target.value;
  this.data.set(name, value);
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
  return this.requiresAdmin() || ['/projector'].indexOf(this.data.id) !== -1;
};
Page.prototype.requiresAdmin = function () {
  return ['/allocationEdit'].indexOf(this.data.id) !== -1;
};
