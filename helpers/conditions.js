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
        sameFloor: propValueSame("floor"),
        sameStaircase: propValueSame("parentid"),
        parentIs: propValueIs("parentid"),
        idIs: propValueIs("id"),
        typeIs: propValueIs("type"),
        roomidIs: propValueIs("roomid"),
        isPermanentlyUnavailable: propValueIs("rentband", 0)
    };
}());