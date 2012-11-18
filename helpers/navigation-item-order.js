function compareText(a, b) {
    if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    } else {
        return 0;
    }
}
function compareNumber(a, b) {
    /// <summary>Compares two numbers to produce numerical ordering not lexiographical.</summary>
    /// <param name="a" type="Number">The first number</param>
    /// <param name="b" type="Number">The second number</param>
    /// <returns type="Number">less than 0 if a&lt;b, equal to 0 if a=b, greater than 0 if a&gt;b</returns>
    return (+a) - (+b);
}
function parentID(a, b) {
    return (function (a, b) {
        if (a === "Root" && b !== "Root") {
            return -1;
        } else if (a !== "Root" && b === "Root") {
            return 1;
        } else {
            return compareText(a, b);
        }
    }(a.parentid, b.parentid));
}
function weight(a, b) {
    return compareNumber(a.weight, b.weight);
}
function floor(a, b) {
    if (a.floor !== undefined && b.floor !== undefined) {
        return compareNumber(a.floor, b.floor);
    }
}
var numbers = /[0-9]+/g;
function itemID(a, b) {
    var aNum = a.id.match(numbers);
    var bNum = b.id.match(numbers);
    if (aNum && bNum && aNum.length > 0 && bNum.length > 0) {
        return compareNumber(parseInt(aNum[0], 10), parseInt(bNum[0], 10)) || (compareNumber(a.id.length, b.id.length) || compareText(a.id, b.id));
    }
    return compareText(a.id, b.id);
}

function orderCascade() {
    var comparisons = arguments;
    return function (a, b) {
        for (var i = 0; i < comparisons.length; i++) {
            var res = comparisons[i](a, b);
            if (res) return res;
        }
    };
}

module.exports = orderCascade(parentID, weight, floor, itemID);
