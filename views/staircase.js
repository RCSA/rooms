var app = require('../app');
var loadMarkdown = require('../markdown/load-markdown');
var template = require('../template');

module.exports = function (staircase) {
    "use strict";
    /// <summary>Loads and displays a staircase.  It will load markdown and structured data separately.</summary>
    /// <param name="SelectedStaircaseID" type="String">The ID of the staircase to display.</param>

    loadMarkdown(staircase);

    var rooms = app.Navigation.filter(c.and(c.parentIs(staircase.id), c.typeIs("room")));
    var floors = rooms.groupBy(c.sameFloor).map(model.floor);

    $("#templated").html(template("staircase", { Floors: floors }));

    app.refreshAllocationsDisplay();
}
