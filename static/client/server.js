var prefix = "/";
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
module.exports = {
    prefix: prefix,
    markdown: {
        read: function (item, callback) {
            setTimeout(function () {
              if (item.body) {
                callback(item.body);
              } else {
                var u = "===============================================";
                callback(item.name + "\n" + ((item.name && u.substr(0, item.name.length)) || u.substr(0, id.length)) +
                            "\n\nThere is no description for this " + item.type + ", why not consider adding one?");
              }
            }, 0);
        },
        update: function (id, content, callback) {
            markdownCache[id] = content;
            $.post(prefix + "data/markdown/" + id, {content: content}, callback);
        }
    },
    navigation: {
        read: function (callback) {
            $.getJSON(prefix + 'data/navigation', callback);
        }
    },
    allocation: {
        update: function (roomid, year, crsid, callback) {
            $.post(prefix + 'data/allocations', put({ roomid: roomid, year: year, crsid: crsid }), callback);
        }
    }
};