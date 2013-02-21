var server = require('./server');
var Emitter = require('emitter');
module.exports = (function () {


    var emitter = new Emitter();

    (function () {
        function notify(data) {
            emitter.emit('raw', data);
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
            s.src = '/socket.io/socket.io.js';
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
                    var socketServer// = "http://rcsa-rooms-stream.herokuapp.com/";
                    var sio = io.connect(socketServer),
                    socket = sio.socket,
                    authComplete = false;
                    gotNotificationKey = function (key) {
                        notificationKey = key || notificationKey;
                        if (notificationKey && socket.connected) {
                            sio.emit("auth", notificationKey, function (data) {
                                notify(data);
                                authComplete = true;
                            });
                        }
                    };
                    sio.on("authRequired", function () {
                        gotNotificationKey();
                    });
                    sio.on("message", function (data) {
                        notify(data);
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
                    url: server.prefix + 'data/stream',
                    dataType: 'json',
                    data: state,
                    success: function (data) {
                        handle(data, 30000);
                    },
                    error: function (u, status) {
                        handle(status, 120000);
                    }
                });
            }
            callNext();
        } ());

    } ());

    var state = {};

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
            emitter.off('default-year-allocation', fn);
        };
    };
    emitter.getAllocations = function (fn) {
        if (allocations.loaded) fn(allocations);
        else emitter.once('allocations', fn);
    };

    return emitter;
} ());