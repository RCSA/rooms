module.exports = (function () {
    "use strict";

    var prefix = "/rooms/";
    function put(spec, isNew) {
        var that = Object.create(spec);
        that.method = "PUT";
        if (isNew !== undefined) {
            that.isNew = isNew;
        }
        return that;
    }
    function del(spec) {
        var that = Object.create(spec);
        that.method = "DELETE";
        return that;
    }
    var markdownCache = {};
    return {
        prefix: prefix,
        markdown: {
            read: function (item, callback) {
                var id = item.id;
                if (markdownCache[id]) {
                    setTimeout(function () { callback(markdownCache[id]); }, 0); //never call callback imediately
                } else {
                    $.getJSON(prefix + 'data/markdown', { id: id }, function (result) {
                        function done(result) {
                            markdownCache[id] = result;
                            callback(result);
                        }
                        if (result === null) {
                            var u = "===============================================";
                            done(item.name + "\n" + ((item.name && u.substr(0, item.name.length)) || u.substr(0, id.length)) +
                                        "\n\nThere is no description for this " + item.type + ", why not consider adding one?");
                        } else {
                            done(result);
                        }
                    });
                }
            },
            update: function (id, content, callback) {
                markdownCache[id] = content;
                $.post(prefix + "data/markdown", put({ id: id, content: content }), callback);
            }
        },
        navigation: {
            create: function (spec, callback) {
                $.post(prefix + "data/navigation", put(spec, true), callback);
            },
            read: function (callback) {
                $.getJSON(prefix + 'data/navigation', callback);
            },
            update: function (id, name, value, success) {
                $.post(prefix + 'data/navigation', put({ id: id, name: name, value: value }, false), success);
            },
            del: function (id, success) {
                $.post(prefix + 'data/navigation', del({ id: id }), success);
            }
        },
        allocation: {
            update: function (roomid, year, crsid, callback) {
                $.post(prefix + 'data/allocations', put({ roomid: roomid, year: year, crsid: crsid }), callback);
            }
        },
        choosingOrder: {
            read: function (callback) {
                $.getJSON(prefix + 'data/choosingorder', callback);
            }
        }
    };
})();