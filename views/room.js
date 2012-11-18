var app = require('../app');
var loadMarkdown = require('../markdown/load-markdown');
var template = require('../template');

module.exports = function (room) {
    /// <summary>Loads and displays a room based on it's staircase ID and room ID.  It will load markdown and structured data separately.</summary>

    loadMarkdown(room);
    $("#templated").html(template("room", room));
    app.refreshAllocationsDisplay();
}