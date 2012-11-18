var app = require('../app');
var converter = require('./converter');
var server = require('../server');

module.exports = function (item, special) {
    /// <summary>Loads markdown and displays it in the markdown element on the page.</summary>
    /// <param name="ID" type="String">The ID of the entity to get markdown for.</param>
    var special = item.isSpecial() || item.isPage() || false;
    server.markdown.read(item, function (md) {
        $("#markdown").html(Mustache.to_html('{{{Content}}}<a id="editLink" href="#/{{ID}}/edit/">edit</a>', {
            ID: item.id,
            Content: converter.makeHtml(md)
          }));
        app.refreshAllocationsDisplay();
        app.checkAuth(item);
    });
}