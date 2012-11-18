var templates = {"allocationEdit":"<h1>Edit allocations for accademic year beginning {{year}}</h1><hr /><div> {{#staircases}} <div class=\"allocationBlock\"><h2>{{{name}}}</h2> {{#rooms}} <form data-old-allocation=\"{{allocation}}\" data-roomid=\"{{id}}\"> {{name}}: <input name=\"allocation\" type=\"text\" value=\"{{allocation}}\" /></form> {{/rooms}} </div> {{/staircases}}</div>","choosingOrderEdit":"<div id=\"tabs\"><ul><li><a href=\"#tabs-1\">First Years</a></li><li><a href=\"#tabs-2\">Second Years</a></li><li><a href=\"#tabs-3\">Third Years</a></li></ul><div id=\"tabs-1\"><ul id=\"sortable\" class=\"sortable\"><li class=\"ui-state-default\"><span class=\"ui-icon ui-icon-arrowthick-2-n-s\"></span>Joe Blogs <button> Delete</button></li><li class=\"ui-state-default\"><span class=\"ui-icon ui-icon-arrowthick-2-n-s\"></span>John Smith </li></ul></div><div id=\"tabs-2\"> Second Years </div><div id=\"tabs-3\"> Third Years </div></div>","markdownEdit":"<form><div class=\"wmd-panel\"><div id=\"wmd-button-bar\"></div><textarea class=\"wmd-input\" id=\"wmd-input\" name=\"content\">{{{Content}}}</textarea></div><div id=\"wmd-preview\" class=\"wmd-panel wmd-preview\"></div><input type=\"submit\" value=\"Save\" /></form><div id=\"getImage\" class=\"dialog\" title=\"Insert Image\"><label> Select an image to upload</label><br /><input type=\"file\" required /></div><div id=\"busy\" class=\"dialog\" title=\"Uploading\"><div class=\"ajaxLoader\"></div></div><div id=\"getURL\" class=\"dialog\" title=\"Insert Hyperlink\"><form><label> http://example.com/ \"optional title\"</label><br /><input name=\"fileUpload\" type=\"url\" value=\"http://\" /><br /></form></div>","NavigationList":"{{#Links}} <a href=\"{{url}}\" {{#selected}}class=\"Selected\"{{/selected}}>{{{name}}}</a>{{/Links}}","navigationTableEdit":"<h2> Add New</h2><form><label>ID</label><input name=\"id\" type=\"text\" /><label>Name</label><input name=\"name\" type=\"text\" required /><br /><label>Parent ID</label><input name=\"parentid\" type=\"text\" value=\"{{parentid}}\" /><label>Type</label><select name=\"type\"><option>staircase</option><option selected>room</option><option>page</option><option>special</option></select><br /><label>Weight</label><input name=\"weight\" type=\"number\" /><label>Bathroom Sharing</label><input name=\"bathroomsharing\" type=\"number\" value=\"{{bathroomsharing}}\" /><br /><label>Rent Band</label><input name=\"rentband\" type=\"number\" value=\"{{rentband}}\" /><label>Floor</label><input name=\"floor\" type=\"number\" value=\"{{floor}}\" /><br /><input type=\"submit\" value=\"Save\" /></form><h2> Edit Existing</h2><table><tr><th> ID </th><th> Name </th><th> Parent ID </th><th> Type </th><th> Weight </th><th> Bathroom Sharing </th><th> Rent Band </th><th> Floor </th><th></th></tr> {{#Navigation}} <tr itemid=\"{{id}}\"><td itemprop=\"id\" data-type=\"text\"><!--Required but could be \"\"--><div>{{id}}</div><input style=\"display: none; width:110px\" type=\"text\" value=\"{{id}}\" /></td><td itemprop=\"name\" data-type=\"text\"><div>{{{name}}}</div><input style=\"display: none; width:115px\" type=\"text\" required value=\"{{name}}\" /></td><td itemprop=\"parentid\" data-type=\"text\"><!--Required but could be \"\"--><div>{{parentid}}</div><input style=\"display: none; width:40px\" type=\"text\" value=\"{{parentid}}\" /></td><td itemprop=\"type\" data-type=\"text\" style=\"width: 84px\"><div>{{type}}</div><select style=\"display: none;\" required ><option {{#isStaircase}}selected{{/isStaircase}}>staircase</option><option {{#isRoom}}selected{{/isRoom}}>room</option><option {{#isPage}}selected{{/isPage}}>page</option><option {{#isSpecial}}selected{{/isSpecial}}>special</option></select></td><td itemprop=\"weight\" data-type=\"text\"><div>{{weight}}</div><input style=\"display: none; width: 45px\" type=\"number\" value=\"{{weight}}\" /></td><td itemprop=\"bathroomsharing\" data-type=\"text\"><div>{{bathroomsharing}}</div><input style=\"display: none; width:30px\" type=\"number\" value=\"{{bathroomsharing}}\" /></td><td itemprop=\"rentband\" data-type=\"text\"><div>{{rentband}}</div><input style=\"display: none; width:30px\" type=\"number\" value=\"{{rentband}}\" /></td><td itemprop=\"floor\" data-type=\"text\"><div>{{floor}}</div><input style=\"display: none; width:30px\" type=\"number\" value=\"{{floor}}\" /></td><td><button>Delete</button></td></tr> {{/Navigation}}</table>","projector":"{{#staircases}}<div class=\"projectorBlock\"><h1><a href=\"{{url}}\">{{{name}}}</a></h1><ul> {{#rooms}} <li id=\"{{id}}\" class=\"{{css}}\"><a href=\"{{url}}\">{{{name}}}<span class=\"allocationDisplayPart\"> - <span class=\"allocationDisplay\" data-roomid=\"{{id}}\"></span></span></a></li> {{/rooms}} </ul></div>{{/staircases}}","room":"{{#rentband}}<table class=\"horizontalTable\"><tr><th> Bathroom </th><td> {{bathroom}} </td></tr><tr><th> Rent Band </th><td> {{rentBandDescription}} </td></tr><tr><th> Floor </th><td> {{floorDescription}} </td></tr><tr><th> Current Allocation </th><td><span class=\"allocationDisplay\" data-roomid=\"{{id}}\" data-year=\"current\"></span></td></tr><tr><th> Next Year's Allocation </th><td><span class=\"allocationDisplay\" data-roomid=\"{{id}}\" data-year=\"next\"></span></td></tr></table>{{/rentband}}","staircase":"{{#Floors}}<h2> {{Name}}</h2><ul> {{#Rooms}} <li><a href=\"{{url}}\">{{nameSingleLine}}{{#rentband}} - {{#bathroom}}{{bathroom}}, {{/bathroom}}{{rentBandDescription}}, <span class=\"allocationDisplay\" data-roomid=\"{{id}}\"></span>{{/rentband}}</a></li> {{/Rooms}}</ul>{{/Floors}}"};

var Path = { version: "0.8", map: function (a) { if (Path.routes.defined.hasOwnProperty(a)) { return Path.routes.defined[a] } else { return new Path.core.route(a) } }, root: function (a) { Path.routes.root = a }, rescue: function (a) { Path.routes.rescue = a }, history: { pushState: function (a, c, b) { if (Path.history.supported) { if (Path.dispatch(b)) { history.pushState(a, c, b) } } else { if (Path.history.fallback) { window.location.hash = "#" + b } } }, popState: function (a) { Path.dispatch(document.location.pathname) }, listen: function (a) { Path.history.supported = !!(window.history && window.history.pushState); Path.history.fallback = a; if (Path.history.supported) { window.onpopstate = Path.history.popState } else { if (Path.history.fallback) { for (route in Path.routes.defined) { if (route.charAt(0) != "#") { Path.routes.defined["#" + route] = Path.routes.defined[route]; Path.routes.defined["#" + route].path = "#" + route } } Path.listen() } } } }, match: function (k, h) { var b = {}, g = null, e, f, d, c, a; for (g in Path.routes.defined) { if (g !== null && g !== undefined) { g = Path.routes.defined[g]; e = g.partition(); for (c = 0; c < e.length; c++) { f = e[c]; a = k; if (f.search(/:/) > 0) { for (d = 0; d < f.split("/").length; d++) { if ((d < a.split("/").length) && (f.split("/")[d].charAt(0) === ":")) { b[f.split("/")[d].replace(/:/, "")] = a.split("/")[d]; a = a.replace(a.split("/")[d], f.split("/")[d]) } } } if (f === a) { if (h) { g.params = b } return g } } } } return null }, dispatch: function (a) { var b, c; if (Path.routes.current !== a) { Path.routes.previous = Path.routes.current; Path.routes.current = a; c = Path.match(a, true); if (Path.routes.previous) { b = Path.match(Path.routes.previous); if (b !== null && b.do_exit !== null) { b.do_exit() } } if (c !== null) { c.run(); return true } else { if (Path.routes.rescue !== null) { Path.routes.rescue() } } } }, listen: function () { var a = function () { Path.dispatch(location.hash) }; if (location.hash === "") { if (Path.routes.root !== null) { location.hash = Path.routes.root } } else { Path.dispatch(location.hash) } if ("onhashchange" in window) { window.onhashchange = a } else { setInterval(a, 50) } }, core: { route: function (a) { this.path = a; this.action = null; this.do_enter = []; this.do_exit = null; this.params = {}; Path.routes.defined[a] = this } }, routes: { current: null, root: null, rescue: null, previous: null, defined: {}} }; Path.core.route.prototype = { to: function (a) { this.action = a; return this }, enter: function (a) { if (a instanceof Array) { this.do_enter = this.do_enter.concat(a) } else { this.do_enter.push(a) } return this }, exit: function (a) { this.do_exit = a; return this }, partition: function () { var d = [], a = [], c = /\(([^}]+?)\)/g, e, b; while (e = c.exec(this.path)) { d.push(e[1]) } a.push(this.path.split("(")[0]); for (b = 0; b < d.length; b++) { a.push(a[a.length - 1] + d[b]) } return a }, run: function () { var b = false, c, a, d; if (Path.routes.defined[this.path].hasOwnProperty("do_enter")) { if (Path.routes.defined[this.path].do_enter.length > 0) { for (c = 0; c < Path.routes.defined[this.path].do_enter.length; c++) { a = Path.routes.defined[this.path].do_enter[c](); if (a === false) { b = true; break } } } } if (!b) { Path.routes.defined[this.path].action() } } };

var AJAX = (function () {
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

var stream = (function () {
    function Emitter() {
        this._callbacks = {};
    }
    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */
    Emitter.prototype.on = function(event, fn){
      (this._callbacks[event] = this._callbacks[event] || [])
        .push(fn);
      return this;
    };

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */
    Emitter.prototype.off = function(event, fn){
      var callbacks = this._callbacks[event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 == arguments.length) {
        delete this._callbacks[event];
        return this;
      }

      // remove specific handler
      var i = callbacks.indexOf(fn._off || fn);
      if (~i) callbacks.splice(i, 1);
      return this;
    };
    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter} 
     */
    Emitter.prototype.emit = function(event){
      var args = [].slice.call(arguments, 1)
        , callbacks = this._callbacks[event];

      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    };
    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */
    Emitter.prototype.once = function(event, fn){
      var self = this;

      function on() {
        self.off(event, on);
        fn.apply(this, arguments);
      }

      fn._off = on;
      this.on(event, on);
      return this;
    };


    var emitter = new Emitter();

    var subscribeRaw = (function () {
        var subscriptions = [];
        function notify(data) {
            var i;
            for (i = 0; i < subscriptions.length; i++) {
                subscriptions[i](data);
            }
        }



        var notificationKey = false;
        var gotNotificationKey = function (key) {
            notificationKey = key;
        };
        var connected = function () {
            return false;
        };

        //socket
        $(function () {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = 'http://rcsa-rooms-stream.herokuapp.com/socket.io/socket.io.js';
            s.async = false;

            s.onreadystatechange = s.onload = function () {

                var state = s.readyState;

                if (!callback.done && (!state || /loaded|complete/.test(state))) {
                    callback.done = true;
                    callback();
                }
            };

            document.body.appendChild(s);

            function callback() {
                if (typeof io !== "undefined") {
                    var socketServer = "http://rcsa-rooms-stream.herokuapp.com/";
                    var sio = io.connect(socketServer),
                    socket = sio.socket,
                    authComplete = false;
                    gotNotificationKey = function (key) {
                        notificationKey = key || notificationKey;
                        if (notificationKey && socket.connected) {
                            sio.emit("auth", notificationKey, function () {
                                authComplete = true;
                            });
                        }
                    };
                    sio.on("authRequired", function () {
                        gotNotificationKey();
                    });
                    sio.on("message", function (data) {
                        notify(JSON.parse(data));
                    });
                    var failureTime = 0;
                    setInterval(function () {
                        if (connected()) {
                            notify({});
                            failureTime = 0;
                        } else {
                            failureTime++;
                            if (failureTime > 600 + Math.floor(Math.random() * 60)) {
                                failureTime = 0;
                                location.reload(false);
                            }
                        }
                    }, 1000);

                    socket.on("reconnect_failed", function () {
                        setTimeout(function () { window.location.reload(false); }, 500);
                    });
                    connected = function () {
                        return socket.connected && authComplete;
                    };
                }
            }
        });

        //poll
        (function () {
            function callNext() {
                var startTime = new Date();
                function handle(data, minDelay) {
                    var endTime = new Date();
                    if (data.auth && data.auth.notificationKey) {
                        gotNotificationKey(data.auth.notificationKey);
                    }
                    notify(data);
                    setTimeout(callNext, (connected() ? 240000 : minDelay) + (endTime.getTime() - startTime.getTime()) * 10);
                }
                $.ajax({
                    url: AJAX.prefix + 'data/stream',
                    dataType: 'json',
                    data: state,
                    success: function (data) {
                        handle(data, 5000);
                    },
                    error: function (u, status) {
                        handle(status, 120000);
                    }
                });
            }
            callNext();
        } ());

        return function (subscription) {
            subscriptions.push(subscription);
            return function () {
                /// <summary>Unsubscribe</summary>
                subscriptions = subscriptions.filter(function (s) { s != subscription; });
            };
        };
    } ());

    var state = {};
    subscribeRaw(function (data) {
        emitter.emit('raw', data);
    });
    function notFalse(a) {
        return !!a;
    }

    function allocationsChanged(streamResult) {
        return streamResult.allocations !== undefined;
    }
    function allocationYear(defaultText, yearModifier) {
        return Object.create({
            year: (function () {
                var date = new Date();
                return ((date.getMonth() > 6) ? date.getFullYear() : date.getFullYear() - 1) + yearModifier;
            } ()),
            defaultText: defaultText
        });
    }
    var allocations = {
        allocationsThisYear: allocationYear("Unknown", 0),
        allocationsNextYear: allocationYear("Available", 1),
        defaultAllocations: function () {
            if (($("#isThisYears:checked").length === 0)) {
                return this.allocationsNextYear;
            } else {
                return this.allocationsThisYear;
            }
        },
        loaded: false
    };
    function getAllocations(streamResult) {
        for (var i = 0; i < streamResult.allocations.length; i++) {
            var a = streamResult.allocations[i];
            a.year = parseInt(a.year, 10);
            a.timestamp = parseInt(a.timestamp, 10);
            if (state.timestamp === undefined || a.timestamp > state.timestamp) {
                state.timestamp = a.timestamp;
            }
            var roomid = a.roomid;
            var crsid = a.crsid;
            var year = a.year;
            var yearTable = {};
            if (year === allocations.allocationsThisYear.year) {
                yearTable = allocations.allocationsThisYear;
            } else if (year === allocations.allocationsNextYear.year) {
                yearTable = allocations.allocationsNextYear;
            }
            yearTable[roomid] = crsid;
        }
        return allocations;
    }
    function getCurrentAllocations() {
        var currentAllocations = [];
        for (var i in allocations.defaultAllocations()) {
            if (allocations.defaultAllocations().hasOwnProperty(i)) {
                currentAllocations.push({
                    roomid: i,
                    crsid: allocations.defaultAllocations()[i],
                    year: allocations.defaultAllocations().year
                });
            }
        }
        return { allocations: currentAllocations };
    }
    function filterAllocationsArray(allocation) {
        return allocations.defaultAllocations().year === parseInt(allocation.year, 10);
    }
    emitter.on('raw', function (raw) {
        if (raw.auth) {
            state.auth = raw.auth.isAuthenticated;
            emitter.emit('auth', raw.auth);
        }
        if (raw.allocations) {
            allocations.loaded = true;
            emitter.emit('allocations', getAllocations(raw));
            for (var i = 0; i < raw.allocations.length; i++) {
                emitter.emit('allocation', raw.allocations[i]);
                if (allocations.defaultAllocations().year === parseInt(raw.allocations[i].year, 10)) {
                    emitter.emit('default-year-allocation', raw.allocations[i]);
                }
            }
        }
    });
    emitter.onAllocationChanged = function (fn) {
        var current = getCurrentAllocations().allocations;
        for (var i = 0; i < current.length; i++) {
            fn(current[i]);
        }
        emitter.on('default-year-allocation', fn);
        return function () {
            stream.off('default-year-allocation', fn);
        };
    };
    emitter.getAllocations = function (fn) {
        if (allocations.loaded) fn(allocations);
        else emitter.once('allocations', fn);
    };

    return emitter;
} ());


(function () {
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