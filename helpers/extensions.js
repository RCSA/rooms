var help = (function () {
    "use strict";

    /// <summary>Extend Path to use arguments of function for url parameters.</summary>
    Path.core.route.prototype.toOld = Path.core.route.prototype.to;
    Path.core.route.prototype.to = function (fn, args) {
        /// <summary>Set the function to call when the route is run</summary>
        /// <param name="fn" type="function">The function to call when the route is run</param>
        /// <param name="args" type="string[]">The parameters of the route in the order they should be used as arguments for the function.</param>
        /// <returns type="Path.core.route" />

        if (args === undefined) {
            args = [];
        }
        return this.toOld(function () {
            var start = new Date();
            var self = this;
            function SelectParam(p) {
                return self.params[p];
            }
            fn.apply(this, args.map(SelectParam));
            var end = new Date();
            if (typeof console != "undefined") {
                if (typeof console.info === "undefined") {
                    console.log(window.location.hash + " run in " + (end.getTime() - start.getTime()) + "ms");
                } else {
                    console.info(window.location.hash + " run in " + (end.getTime() - start.getTime()) + "ms");
                }
            }
        });
    };
    Path.refresh = function () {
        Path.routes.current = null;
        Path.dispatch(location.hash);
    };

    Array.prototype.groupBy = function (equality) {
        function isMatch(a) {
            return function (b) {
                return equality(a, b[0]);
            }
        }
        return this.reduce(
                function (acc, curr) {
            if (!(acc.some(isMatch(curr)))) {
                acc.push([curr]);
            } else {
                acc.filter(isMatch(curr))[0].push(curr);
            }
            return acc;
        }, []);
    };
}());