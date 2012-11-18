var curry = require('curry');

var c = (function () {
    var propValueIs = curry(function (property, value, item) {
        if (typeof item[property] === "function") {
            return item[property]() === value;
        } else {
            return item[property] === value;
        }
    });
    var propValueSame = curry(function (property, itemA, itemB) {
        return itemA[property] === itemB[property];
    });
    return {
        and: function () {
            var andings = arguments;
            return function (v, i, a) {
                for (var i = 0; i < andings.length; i++) {
                    if (!andings[i](v, i, a))
                        return false;
                }
                return true;
            }
        },
        or: function () {
            var orings = arguments;
            return function (v, i, a) {
                for (var i = 0; i < orings.length; i++) {
                    if (orings[i](v, i, a))
                        return true;
                }
                return false;
            }
        },
        not: curry(function (fn, v, i, a) {
            return !fn(v, i, a);
        }),
        sameFloor: propValueSame("floor"),
        sameStaircase: propValueSame("parentid"),
        parentIs: propValueIs("parentid"),
        idIs: propValueIs("id"),
        typeIs: propValueIs("type"),
        roomidIs: propValueIs("roomid"),
        isPermanentlyUnavailable: propValueIs("rentband", 0),
        equals: curry(function (a, b) {
            return a === b;
        })
    };
}());