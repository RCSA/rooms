module.exports = queue;
queue(module.exports);

function queue(mixin) {
    var stack1 = [];
    var stack2 = [];
    var exports = mixin || {};
    exports.enqueue = function (item) {
        stack1.push(item);
    };
    function repare() {
        if (stack2.length === 0) {
            var length = stack1.length;
            for (var i = 0; i < length; i++) {
                stack2.push(stack1.pop());
            }
        }
        return exports;
    }
    exports.dequeue = function () {
        repare();
        if (!stack2.length) throw new Error('Can\'t dequeue from an empty queue');
        return stack2.pop();
    };
    exports.peek = function () {
        repare();
        if (!stack2.length) throw new Error('Can\'t peek from an empty queue');
        return stack2[stack2.length - 1];
    };
    exports.isEmpty = function () {
        return stack1.length === 0 && stack2.length === 0;
    };
    return exports;
}