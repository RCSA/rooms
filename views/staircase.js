var app = require('../app');
var loadMarkdown = require('../markdown/load-markdown');
var template = require('../template');
var groupBy = require('group-by');

module.exports = function (staircase) {
    "use strict";
    /// <summary>Loads and displays a staircase.  It will load markdown and structured data separately.</summary>
    /// <param name="SelectedStaircaseID" type="String">The ID of the staircase to display.</param>

    loadMarkdown(staircase);

    var rooms = app.Navigation.filter(c.parentIs(staircase.id)).filter(c.typeIs("room"));
    var floors = toFloorsArray(groupBy(rooms, 'floor'));

    $("#templated").html(template("staircase", { Floors: floors }));

    app.refreshAllocationsDisplay();
}

function toFloorsArray(floors) {
  return Object.keys(floors)
    .map(function (floor) {
      return {
        Name: floors[floor][0].floorDescription(),
        Rooms: floors[floor]
      }
    });
}