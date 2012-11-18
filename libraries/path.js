var Path = { version: "0.8", map: function (a) { if (Path.routes.defined.hasOwnProperty(a)) { return Path.routes.defined[a] } else { return new Path.core.route(a) } }, root: function (a) { Path.routes.root = a }, rescue: function (a) { Path.routes.rescue = a }, history: { pushState: function (a, c, b) { if (Path.history.supported) { if (Path.dispatch(b)) { history.pushState(a, c, b) } } else { if (Path.history.fallback) { window.location.hash = "#" + b } } }, popState: function (a) { Path.dispatch(document.location.pathname) }, listen: function (a) { Path.history.supported = !!(window.history && window.history.pushState); Path.history.fallback = a; if (Path.history.supported) { window.onpopstate = Path.history.popState } else { if (Path.history.fallback) { for (route in Path.routes.defined) { if (route.charAt(0) != "#") { Path.routes.defined["#" + route] = Path.routes.defined[route]; Path.routes.defined["#" + route].path = "#" + route } } Path.listen() } } } }, match: function (k, h) { var b = {}, g = null, e, f, d, c, a; for (g in Path.routes.defined) { if (g !== null && g !== undefined) { g = Path.routes.defined[g]; e = g.partition(); for (c = 0; c < e.length; c++) { f = e[c]; a = k; if (f.search(/:/) > 0) { for (d = 0; d < f.split("/").length; d++) { if ((d < a.split("/").length) && (f.split("/")[d].charAt(0) === ":")) { b[f.split("/")[d].replace(/:/, "")] = a.split("/")[d]; a = a.replace(a.split("/")[d], f.split("/")[d]) } } } if (f === a) { if (h) { g.params = b } return g } } } } return null }, dispatch: function (a) { var b, c; if (Path.routes.current !== a) { Path.routes.previous = Path.routes.current; Path.routes.current = a; c = Path.match(a, true); if (Path.routes.previous) { b = Path.match(Path.routes.previous); if (b !== null && b.do_exit !== null) { b.do_exit() } } if (c !== null) { c.run(); return true } else { if (Path.routes.rescue !== null) { Path.routes.rescue() } } } }, listen: function () { var a = function () { Path.dispatch(location.hash) }; if (location.hash === "") { if (Path.routes.root !== null) { location.hash = Path.routes.root } } else { Path.dispatch(location.hash) } if ("onhashchange" in window) { window.onhashchange = a } else { setInterval(a, 50) } }, core: { route: function (a) { this.path = a; this.action = null; this.do_enter = []; this.do_exit = null; this.params = {}; Path.routes.defined[a] = this } }, routes: { current: null, root: null, rescue: null, previous: null, defined: {}} }; Path.core.route.prototype = { to: function (a) { this.action = a; return this }, enter: function (a) { if (a instanceof Array) { this.do_enter = this.do_enter.concat(a) } else { this.do_enter.push(a) } return this }, exit: function (a) { this.do_exit = a; return this }, partition: function () { var d = [], a = [], c = /\(([^}]+?)\)/g, e, b; while (e = c.exec(this.path)) { d.push(e[1]) } a.push(this.path.split("(")[0]); for (b = 0; b < d.length; b++) { a.push(a[a.length - 1] + d[b]) } return a }, run: function () { var b = false, c, a, d; if (Path.routes.defined[this.path].hasOwnProperty("do_enter")) { if (Path.routes.defined[this.path].do_enter.length > 0) { for (c = 0; c < Path.routes.defined[this.path].do_enter.length; c++) { a = Path.routes.defined[this.path].do_enter[c](); if (a === false) { b = true; break } } } } if (!b) { Path.routes.defined[this.path].action() } } };


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

module.exports = Path;