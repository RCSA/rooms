var loadMarkdown = require('../markdown/load-markdown');

module.exports = staticPage;
function staticPage(item) {
    loadMarkdown(item, true);
    $("#templated").html("");
}