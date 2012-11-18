var queue = require('queue');
var Markdown = require('../libraries/pagedown.js');

var converter = module.exports = Markdown.getSanitizingConverter();
//Remove http from links display text
converter.hooks.chain("plainLinkText", function (url) {
    return url.replace(/^https?:\/\//, "");
});
//suport using #bang urls
converter.hooks.chain("preConversion", function (text) {
    return text.replace(/\(#(.*)\)/g, "(http://hashurl.com/$1)")
                .replace(/]: #(.*)/g, "]: http://hashurl.com/$1");
});
converter.hooks.chain("postConversion", function (text) {
    return text.replace(/http:\/\/hashurl.com\//g, "#");
});
//support // as line comment
converter.hooks.chain("preConversion", function (text) {
    return text.replace(/((\r\n|\n|\r)\/\/.*$)|(^\/\/.*(\r\n|\n|\r))/gm, "");
});
//Allow insertion of -allocation:roomid-
converter.hooks.chain("postConversion", function (text) {
    return text.replace(/\[allocation:([^\]]*)\]/g, '<span class="allocationDisplay" data-roomid="$1"></span>')
            .replace(/\[allocation-current:([^\]]*)\]/g, '<span class="allocationDisplay" data-roomid="$1" data-year="current"></span>')
            .replace(/\[allocation-next:([^\]]*)\]/g, '<span class="allocationDisplay" data-roomid="$1" data-year="next"></span>');
});
//Allow alignment of images (right or left)
converter.hooks.chain("postConversion", function (text) {
    return text.replace(/\/>\[(left|right|middle|top|bottom)\]/g, 'align="$1" />');
});
converter.hooks.chain("postConversion", function (text) {
    return text.replace(/<\/h1>/g, "</h1><hr>");
});
//Allow a table
(function () {
    var tables = queue();
    converter.hooks.chain("preConversion", function (text) {
        function parseLine(line, tag) {
            return "<tr><" + tag + ">" +
                    line.replace(/^\||\|$/g, "").replace(/\|/g, "</" + tag + "><" + tag + ">")
               + "</" + tag + "></tr>";
        }

        var result = text.replace(/(\r\n|\n|\r)/gm, "\n")
    .replace(
        /^([^\n]*\|[^\n]*)\n[\s-\|]*-[\s-\|]*$/gm,
        function (a, line) {
            return parseLine(line, "th");
        })
        .replace(/^(.*)\|(.*)$/gm, function (line) {
            return parseLine(line, "td");
        })
    .replace(/^\n((?:<tr>[^\n]*\n)+)$/gm, function (u, table) {
            tables.enqueue("<table>" + table + "</table>");
            return "\n\n[table]\n\n";
        });
        return result;
    });
    converter.hooks.chain("postConversion", function (text) {
        return text.replace(/<p>\[table\]<\/p>/gm, tables.dequeue);
    });
}());