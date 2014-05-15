var app = require('../');
var loadMarkdown = require('../markdown/load-markdown');
var template = require('../template');
var groupBy = require('../helpers/group-by');
var condition = require('to-bool-function');

module.exports = function (staircase) {
    loadMarkdown(staircase);

    var rooms = app.Navigation
      .filter(condition('parentid', staircase._id))
      .filter(condition('type', 'room'));

    var floors = toFloorsArray(groupBy(rooms, 'floor'));

    document.getElementById('templated').innerHTML = template('staircase', { Floors: floors });

    app.refreshAllocationsDisplay();
}

function toFloorsArray(floors) {
  return Object.keys(floors)
    .map(function (floor) {
      return {
        floor: floor,
        Name: floors[floor][0].floorDescription(),
        Rooms: floors[floor]
      }
    })
    .sort(function (f1, f2) {
      return f1.floor - f2.floor;
    });
}