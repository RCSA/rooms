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