/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("ForbesLindesay-curry/index.js", function(module, exports, require){
function makeArray(args) {
  return Array.prototype.slice.apply(args);
}

/**
 * Curry a function
 *
 * @param  {function} fn The function you wish to curry
 * @return {function}
 */
module.exports = curry;
function curry(fn) {
  function curried() {
    if (arguments.length < fn.length) {
      var args = makeArray(arguments);
      return function () {
        return curried.apply(this, args.concat(makeArray(arguments)));
      }
    } else {
      return fn.apply(this, arguments);
    }
  };
  return curried;
}
});
require.register("ForbesLindesay-queue/index.js", function(module, exports, require){
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
});
require.register("ForbesLindesay-utf8-encode/index.js", function(module, exports, require){
module.exports = encode;

function encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
}
});
require.register("ForbesLindesay-base64-encode/index.js", function(module, exports, require){
var utf8Encode = require('utf8-encode');
var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

module.exports = encode;
function encode(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = utf8Encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);

    }

    return output;
}
});
require.register("component-to-function/index.js", function(module, exports, require){

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * TODO: consider compiling to functions.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch (typeof obj) {
    case 'function':
      return obj;
    case 'string':
      return stringToFunction(obj);
    default:
      throw new TypeError('invalid callback "' + obj + '"');
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  var props = str.split('.');
  return function(obj){
    for (var i = 0; i < props.length; ++i) {
      if (null == obj) return;
      var name = props[i];
      if ('function' == typeof obj[name]) {
        obj = obj[name]();
      } else {
        obj = obj[name];
      }
    }
    return obj;
  }
}
});
require.register("component-find/index.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Find the first value in `arr` with when `fn(val, i)` is truthy.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

module.exports = function(arr, fn){
  // callback
  if ('function' != typeof fn) {
    if (Object(fn) === fn) fn = objectToFunction(fn);
    else fn = toFunction(fn);
  }

  // filter
  for (var i = 0, len = arr.length; i < len; ++i) {
    if (fn(arr[i], i)) return arr[i];
  }
};

/**
 * Convert `obj` into a match function.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  return function(o){
    for (var key in obj) {
      if (o[key] != obj[key]) return false;
    }
    return true;
  }
}
});
require.register("rooms/app.js", function(module, exports, require){
var staticPage = require('./views/static-page');
var loadStaircase = require('./views/staircase');
var loadRoom = require('./views/room');
var projectorView = require('./views/projector');//{enter, exit}
var allocationEdit = require('./views/allocation-edit');//{enter, exit}
var navigationTableEdit = require('./views/navigation-table-edit');
var editMarkdown = require('./markdown/edit-markdown');

var model = require('./model');
var navigationItemOrder = require('./helpers/navigation-item-order');
var find = require('find');
var loginURI = require('./helpers/status-display').uri;
var template = require('./template');

var $ = jQuery;
exports.SelectedStaircaseID = '';
exports.SelectedRoomID = '';
exports.Navigation = [];
exports.RentBands = [];
exports.authorization = false;


//Allocations
$(function () {
    var currentAllocations = false;
    function tryRefreshAllocationsDisplay() {
        if (currentAllocations) {
            refreshAllocationsDisplay(currentAllocations);
        }
        return exports;
    }
    function refreshAllocationsDisplay(allocations) {
        currentAllocations = allocations;
        $(".allocationDisplay").each(function () {
            var self = $(this);
            var yearTable = {};
            if (self.attr("data-year") === "current") {
                yearTable = allocations.allocationsThisYear;
            } else if (self.attr("data-year") === "next") {
                yearTable = allocations.allocationsNextYear;
            } else {
                yearTable = allocations.defaultAllocations();
            }
            self.html(yearTable[self.attr("data-roomid")] || yearTable.defaultText);
        });
    }
    stream.on('allocations', refreshAllocationsDisplay);
    exports.refreshAllocationsDisplay = tryRefreshAllocationsDisplay;
});
//Authentication
$(function () {
    var currentAuth = false;
    var currentItem;
    function tryCheckAuth(item) {
        currentItem = item;
        if (exports.authorization) {
            checkAuth(exports.authorization, true);
        }
        return exports;
    }
    function checkAuth(auth, skipNavigationReload) {
        exports.authorization = auth;
        if (skipNavigationReload !== true) {
            exports.reloadNavigation();
        }
        if (auth.isAuthenticated) {
            $("#login").hide();
        } else {
            $("#login").show();
        }
        if (currentItem) {
            if (auth.markdownEdit && ((currentItem.isRoom && currentItem.isRoom()) ||
                (currentItem.isStaircase && currentItem.isStaircase()) ||
                exports.authorization.markdownSpecialEdit)) {
                $("#editLink").show();
            } else {
                $("#editLink").hide();
            }
            if (auth.isAuthenticated === false && (location.hash === "#/projector/" || location.hash === "#/navigationTableEdit/" || location.hash === "#/allocationEdit/" || (/\/edit\/$/).test(location.hash))) {
                var uri = loginURI();
                location.hash = "#/";
                window.location.href = uri;
                return;
            }
        }
    }
    stream.on('auth', checkAuth);
    exports.checkAuth = tryCheckAuth;
});

exports.reloadNavigation = function (SelectedStaircaseID, SelectedRoomID) {
    /// <summary>Updates the display of navigation menues to include what's currently selected</summary>
    if (arguments.length > 0) {
        exports.SelectedStaircaseID = SelectedStaircaseID;
        exports.SelectedRoomID = SelectedRoomID;
    }

    function permission(item) {
        //Display projector link because it can be used to log in.
        if (item.id === "navigationTableEdit") {
            return exports.authorization && exports.authorization.navigationEdit;
        } else if (item.id === "allocationEdit") {
            return exports.authorization && exports.authorization.allocationsEdit;
        } else {
            return true;
        }
    }
    var nav = exports.Navigation.filter(permission);

    //Load Staircases
    var Staircases = nav.filter(c.parentIs("Root"));
    $("#staircases").html(template("NavigationList", { Links: Staircases }));

    //Load Rooms
    var Rooms = nav.filter(c.parentIs(exports.SelectedStaircaseID));
    $("#rooms").html(template("NavigationList", { Links: Rooms }));
}

function mapPaths() {
    //path, itemID, parentIDs, edit
    function map(path, spec) {
        var exit = spec.exit || function () { };
        Path.map(path).to(function () {
            var item = find(exports.Navigation, c.idIs(this.params[spec.id] || spec.id)) || spec.item;
            var parentid = this.params[spec.parentIDs] || spec.parentIDs;
            if (!parentid || (item.parentid === parentid) || (spec.parentIDs.some && spec.parentIDs.some(c.equals(item.parentid)))) {
                navigateToItem(item, spec.edit, spec.enter);
            }
        }).exit(exit);
    }
    function navigateToItem(item, edit, enter) {
        if (item) {
            if (exports.checkAuth(item) !== false) {
                if (item.parentid === "Root") {
                    exports.reloadNavigation(item.id);
                } else {
                    exports.reloadNavigation(item.parentid, item.id);
                }
                if (edit) {
                    editMarkdown(item);
                } else {
                    switch (item.type) {
                        case "staircase":
                            return loadStaircase(item);
                        case "page":
                            return staticPage(item);
                        case "room":
                            return loadRoom(item);
                        case "special":
                            return enter(item);
                        default:
                            return false;
                    }
                }
            }
        } else {
            return false;
        }
    }

    Path.map("#/projector/").to(projectorView.enter).exit(projectorView.exit);

    map("#/allocationEdit/", {
        id: "allocationEdit",
        enter: allocationEdit.enter,
        exit: allocationEdit.exit
    });
    map("#/navigationTableEdit/", {
        id: "navigationTableEdit",
        enter: navigationTableEdit,
        item: {//provide backup item
            id: "navigationTableEdit",
            type: "special"
        }
    });
    map("#//edit/", {
        id: "",
        parentIDs: "",
        edit: true
    });
    map("#/:id/edit/", {
        id: "id",
        edit: true
    });
    map("#/", {
        id: "",
        parentIDs: ""
    });
    map("#/:sid/", {
        id: "sid",
        parentIDs: ["", "Root"]
    });
    map("#/:sid/:rid/", {
        id: "rid",
        parentIDs: "sid"
    });
}

function run() {
    var isReady = false;
    (function (ready) {
        AJAX.navigation.read(function (data) {
            /// <summary>Load all the navigationd ata up front then start the applicaion.</summary>
            /// <param name="data" type="Array">The Navigation Data</param>
            exports.Navigation = data.map(model.navigationItem).sort(navigationItemOrder);
            $(ready);
        })
    }(function () {
        $("body").removeClass("loading").addClass("background");
        $("#page").fadeIn();
        Path.listen();
        isReady = true;
        $("#isThisYears").click(exports.refreshAllocationsDisplay);
    }));
}

Path.root("#/");
mapPaths();
run();
});
require.register("rooms/model.js", function(module, exports, require){
﻿var app = require('./app');

function cleanSpec(spec) {
    var i;
    var props = ['bathroomsharing', 'rentband', 'floor', 'isgardenfacing'];
    for (i = 0; i < props.length; i++) {
        if (spec[props[i]] === null) {
            delete spec[props[i]];
        }
    }
    var nums = ['bathroomsharing', 'rentband', 'floor'];
    for (i = 0; i < nums.length; i++) {
        if (spec[nums[i]]) {
            spec[nums[i]] = parseInt(spec[nums[i]], 10);
        }
    }
}

var floorDescription = (function () {
    var floors = [
            "Ground Floor", "First Floor", "Second Floor", "Third Floor",
            "Fourth Floor", "Fith Floor", "Sixth Floor"
        ];
    floors[-1] = "Basement";
    return function () {
        return floors[this.floor] || "Floor " + this.floor;
    };
}());
var rentBandDescription = (function () {
    var rentBands = ["Unavailable to Students", "Value", "Standard", "Standard Plus", "Best"];
    return function () {
        return rentBands[this.rentband] || this.rentband;
    };
}());
function typeIs(type) {
    return function () {
        return this.type === type;
    };
}
isStaircase = typeIs("staircase");
isRoom = typeIs("room");
isPage = typeIs("page");
isSpecial = typeIs("special");
function url() {
    var URL = "#/";
    if (this.parentid !== "" && this.parentid !== "Root") {
        URL += this.parentid + "/";
    }
    if (this.id !== "") {
        URL += this.id + "/";
    }
    return URL;
}
function selected() {
    return (this.parentid === "Root" && app.SelectedStaircaseID === this.id) ||
                (this.parentid === app.SelectedStaircaseID && app.SelectedRoomID === this.id);
}
function bathroom() {
    switch (this.bathroomsharing) {
        case 0:
            return "";
        case 1:
            return "Ensuite";
        default:
            return "Shared between " + this.bathroomsharing + " people";
    }
}
function gardenFacing() {
    return (this.isgardenfacing === 1) ? "Garden Facing" :
        ((this.isgardenfacing === 0) ? "Courtyard Facing" :
        "unknown");
}
function allocation() {
    return app.allocationsNextYear[this.id] || "";
}
function nameSingleLine() {
    return this.name.replace(/<br\/>/g, " ");
}

module.exports.navigationItem = function (spec) {
    cleanSpec(spec);
    var that = Object.create(spec);
    that.weight = spec.weight || 0;

    that.isStaircase = isStaircase;
    that.isRoom = isRoom;
    that.isPage = isPage;
    that.isSpecial = isSpecial;

    that.url = url;
    that.selected = selected;
    that.bathroom = bathroom;
    that.floorDescription = floorDescription;
    that.gardenFacing = gardenFacing;

    that.allocation = allocation;
    that.nameSingleLine = nameSingleLine;

    that.rentBandDescription = rentBandDescription;

    return that;
}
module.exports.floor = function (rooms) {
    return {
        Name: rooms[0].floorDescription(),
        Rooms: rooms
    };
}

});
require.register("rooms/views/static-page.js", function(module, exports, require){
﻿var loadMarkdown = require('../markdown/load-markdown');

module.exports = staticPage;
function staticPage(item) {
    loadMarkdown(item, true);
    $("#templated").html("");
}
});
require.register("rooms/views/staircase.js", function(module, exports, require){
var app = require('../app');
var loadMarkdown = require('../markdown/load-markdown');
var template = require('../template');
var model = require('../model');

module.exports = function (staircase) {
    "use strict";
    /// <summary>Loads and displays a staircase.  It will load markdown and structured data separately.</summary>
    /// <param name="SelectedStaircaseID" type="String">The ID of the staircase to display.</param>

    loadMarkdown(staircase);

    var rooms = app.Navigation.filter(c.and(c.parentIs(staircase.id), c.typeIs("room")));
    var floors = rooms.groupBy(c.sameFloor).map(model.floor);

    $("#templated").html(template("staircase", { Floors: floors }));

    app.refreshAllocationsDisplay();
}

});
require.register("rooms/views/room.js", function(module, exports, require){
var app = require('../app');
var loadMarkdown = require('../markdown/load-markdown');
var template = require('../template');

module.exports = function (room) {
    /// <summary>Loads and displays a room based on it's staircase ID and room ID.  It will load markdown and structured data separately.</summary>

    loadMarkdown(room);
    $("#templated").html(template("room", room));
    app.refreshAllocationsDisplay();
}
});
require.register("rooms/views/projector.js", function(module, exports, require){
﻿var app = require('../app');
var find = require('find');
var loginURI = require('../helpers/status-display').uri;
var template = require('../template');
var navigationItemOrder = require('../helpers/navigation-item-order');

var homeHTML;
var selectRoom = function (room) {
    var that = Object.create(room);
    if (room.rentband === 0) {
        that.css = "permanentlyUnavailable";
    } else {
        that.css = ""
    }
    return that;
}
var selectStaircaseGroup = function (roomsInStaircase) {
    var staircaseID = roomsInStaircase[0].parentid;
    var that = Object.create(find(app.Navigation, c.idIs(staircaseID)));
    that.rooms = roomsInStaircase.map(selectRoom);
    return that;
};
var normalInterval = 5000;
var isInProjectorMode = false;
$("#isThisYears").click(function () {
    if (isInProjectorMode) {
        exports.exit();
        Path.refresh();
    }
});
var displayUnavailableRooms = true;
var disposeSubscription;

exports.enter = function () {
        app.checkAuth({ id: "projector" });
        isInProjectorMode = true;
        if (app.authorization.updated && !app.authorization.isAuthenticated && !app.authorization.allocationsView) {
            var uri = loginURI();
            location.hash = '#/';
            window.location.href = uri;
            return;
        }
        homeHTML = $("#colmask").html();
        $("#header").html('<input type="checkbox" ' + (displayUnavailableRooms?"":"checked") + '>Hide Unavailable Rooms').find("input").click(function () {
            displayUnavailableRooms = ($("#header :checkbox:checked").length === 0);
            if (displayUnavailableRooms) {
                $(".allocationDisplayPart").fadeIn(5000);
                $(".unavailable:not(.permanentlyUnavailable)").fadeIn(5000);
            } else {
                $(".allocationDisplayPart").fadeOut(2000);
                $(".unavailable").fadeOut(2000);
            }
        });
        var mappedStaircases = app.Navigation.filter(c.typeIs("room")).groupBy(c.sameStaircase).map(selectStaircaseGroup).sort(navigationItemOrder);
        $("#page").removeClass("page").addClass("projector");
        $("body").removeClass("background");
        $("#colmask").html(template("projector", { staircases: mappedStaircases }));
        $("footer").hide();
        app.refreshAllocationsDisplay();
        disposeSubscription = stream.onAllocationChanged(updatedAllocation);
        function updatedAllocation(allocation) {
            var roomid = allocation.roomid;
            if (allocation.crsid === "") {
                $("#" + roomid).addClass("available").removeClass("unavailable").fadeIn();
                if (!displayUnavailableRooms) {
                    $(".allocationDisplayPart").hide();
                }
            } else {
                $("#" + roomid).removeClass("available").addClass("unavailable")
                        .find(".allocationDisplayPart").show();;
                if (!displayUnavailableRooms) {
                    $("#" + roomid).fadeOut(5000);
                }
            }
        }
        if (!displayUnavailableRooms) {
            $(".allocationDisplayPart").hide();
            $(".unavailable").hide();
        }
    },
exports.exit = function () {
    isInProjectorMode = false;
    disposeSubscription();
    $("#page").addClass("page").removeClass("projector");;
    $("body").addClass("background");
    $("#colmask").html(homeHTML);
    $("footer").show();
    $("#header").html('');
}
});
require.register("rooms/views/navigation-table-edit.js", function(module, exports, require){
﻿var app = require('../app');
var model = require('../model');
var loadMarkdown = require('../markdown/load-markdown');
var toTable = require('../helpers/table');
var setStatus = require('../helpers/status-display').setStatus;
var template = require('../template');
var navigationItemOrder = require('../helpers/navigation-item-order');

function validBathroom(n) {
    return !isNaN(Number(n)) && Number(n) >= 0;
}
function validFloor(n) {
    return !isNaN(Number(n)) && Number(n) > -5 && Number(n) < 20;;
}
function weightNotDefault(n) {
    return !isNaN(Number(n)) && Number(n) !== 0;
}

function validationError(message) {
    alert(message);
    return false;
}
function validateSpec(spec, idChange) {
    if (idChange && app.Navigation.some(c.idIs(spec.id))) {
        return validationError("There is already an item with this ID");
    } else if (spec.id === spec.parentid) {
        return validationError("An item can't be its own parent");
    } else if (spec.parentid !== "Root" && !app.Navigation.some(c.idIs(spec.parentid))) {
        return validationError('The parent ID must either be the ID of an existing item or "Root"');
    }

    if (spec.type === "room") {
        if (!validBathroom(spec.bathroomsharing)) {
            return validationError('A room must have a number greater than 0 to specify how many people the bathroom is shared with.');
        } else if (!validFloor(spec.floor)) {
            return validationError('A room must have a sensible floor number.');
        }
    } else {
        if (spec.bathroomsharing !== undefined) {
            return validationError('Only a room can have a value for Bathroom Sharing.');
        } else if (spec.rentband !== undefined) {
            return validationError('Only a room can have a value for Rent Band.');
        } else if (spec.floor !== undefined) {
            return validationError('Only a room can have a value for Floor.');
        } else if (spec.isgardenfacing !== undefined) {
            return validationError('Only a room can have a value for Garde Facing.');
        }
    }

    return true;
}
function cascadeIDChange(oldID, newID) {
    var children = app.Navigation.filter(c.parentIs(oldID));
    for (var i = 0; i < children.length; i++) {
        children[i].parentid = newID;
    }
}

function create(e) {
    var form = e.target;
    var spec = {
        id: form.id.value,
        name: form.name.value,
        parentid: form.parentid.value,
        type: form.type.value
    };
    if (weightNotDefault(form.weight.value)) {
        spec.weight = form.weight.value;
    }
    if (spec.type === "room") {
        spec.bathroomsharing = form.bathroomsharing.value;
        spec.rentband = form.rentband.value;
        spec.floor = form.floor.value;
    }

    if (validateSpec(spec, true)) {
        app.Navigation.push(model.navigationItem(spec));
        app.Navigation = app.Navigation.sort(navigationItemOrder);
        setStatus("Saving...");
        AJAX.navigation.create(spec, function (result) {
            setStatus("Saved", 2000);
        });
        view.navigationTableEdit(model.navigationItem(spec));
    }
    return false;
}
function update(id, name, value) {
    var item = app.Navigation.filter(c.idIs(id))[0];
    var spec = Object.create(item);
    spec[name] = value;

    if (validateSpec(spec, name === "id")) {
        item[name] = value;
        if (name === "id") {
            //The server must also separely ensure the cascade works, including markdown, allocation etc.
            cascadeIDChange(id, value);
        }
        setStatus("Saving...");
        AJAX.navigation.update(id, name, value, function (result) {
            setStatus("Saved", 2000);
        });
    } else {
        return false;
    }
}
var savedItem;
module.exports = function (item) {
    if (item.id === "navigationTableEdit") {
        savedItem = item;
    } else {
        var previous = item;
        item = savedItem;
    }

    loadMarkdown(item, true);
    var model = previous ? Object.create(previous) : {};
    model.Navigation = app.Navigation;
    $("#templated")
        .html(template("navigationTableEdit", model))
        .find("form").submit(create);
    toTable('#templated');
    $("#templated button").click(function (e) {
        if (confirm("Are you sure you want to delete?")) {
            var id = $(e.target).parents("tr").attr("itemid");
            var index = app.Navigation.indexOf(app.Navigation.filter(c.idIs(id))[0]);
            app.Navigation.splice(index, 1);
            view.navigationTableEdit();
            setStatus("Deleting...");
            AJAX.navigation.del(id, function (result) {
                setStatus("Deleted", 2000);
            });
        }
    });
    app.reloadNavigation("", "navigationTableEdit");
};
});
require.register("rooms/views/allocation-edit.js", function(module, exports, require){
﻿var app = require('../app');
var setStatus = require('../helpers/status-display').setStatus;
var curry = require('curry');
var find = require('find');
var template = require('../template');
var navigationItemOrder = require('../helpers/navigation-item-order');
var loadMarkdown = require('../markdown/load-markdown');

var selectRoomAllocation = curry(function (allocations, room) {
    var allocation = allocations[room.id];
    return {
        id: room.id,
        name: room.nameSingleLine(),
        allocation: allocation || ""
    };
});
var selectStaircaseGroup = curry(function (allocations, roomsInStaircase) {
    var staircaseID = roomsInStaircase[0].parentid;
    var that = Object.create(find(app.Navigation, c.idIs(staircaseID)));
    that.rooms = roomsInStaircase.map(selectRoomAllocation(allocations));
    return that;
});
var isInAllocationEdit = false;
$("#isThisYears").click(function () {
    if (isInAllocationEdit) {
        Path.refresh();
    }
});
var oldItem;

exports.enter = function (item) {
    isInAllocationEdit = true;
    loadMarkdown(item, true);
    $("#templated").html();
    stream.getAllocations(function (allocationsData) {
        var allocations = allocationsData.defaultAllocations();
        var year = allocations.year;
        var mappedStaircases = app.Navigation.filter(c.typeIs("room")).filter(c.not(c.isPermanentlyUnavailable))
            .groupBy(c.sameStaircase).map(selectStaircaseGroup(allocations)).sort(navigationItemOrder);
        $("#templated")
            .html(template("allocationEdit", { staircases: mappedStaircases, year: year }))
            .find("form").submit(function (e) {
                var value = e.currentTarget.allocation.value;
                var form = $(e.currentTarget);
                form.find("input").removeClass("validationError");
                if (form.attr("data-old-allocation") !== value) {
                    form.attr("data-old-allocation", value);
                    setStatus("Updating Allocation");
                    AJAX.allocation.update(form.attr("data-roomid"), year, value, function (result) {
                        setStatus(result, 5000);
                    });
                }
                return false;
            }).find("input").blur(function (e) {
                $(e.target).submit();
            });
        });
    stream.onAllocationChanged(function (allocation) {
        var roomid = allocation.roomid;
        $('form[data-roomid="' + roomid + '"] input').val(allocation.crsid);
    });
    app.reloadNavigation("", "allocationEdit");
};
exports.exit = function () {
    isInAllocationEdit = false;
};
});
require.register("rooms/markdown/load-markdown.js", function(module, exports, require){
var app = require('../app');
var converter = require('./converter');

module.exports = function (item, special) {
    /// <summary>Loads markdown and displays it in the markdown element on the page.</summary>
    /// <param name="ID" type="String">The ID of the entity to get markdown for.</param>
    var special = item.isSpecial() || item.isPage() || false;
    AJAX.markdown.read(item, function (md) {
        $("#markdown").html(Mustache.to_html('{{{Content}}}<a id="editLink" href="#/{{ID}}/edit/">edit</a>', {
            ID: item.id,
            Content: converter.makeHtml(md)
          }));
        app.refreshAllocationsDisplay();
        app.checkAuth(item);
    });
}
});
require.register("rooms/markdown/edit-markdown.js", function(module, exports, require){
var app = require('../app');
var converter = require('./converter');
var setStatus = require('../helpers/status-display').setStatus;
var Markdown = require('../libraries/pagedown.js');
var template = require('../template');

var imgurAPIKey = "e0b484465d77858ebaf6b3c7c1732909";
function upload(file, callback) {

    // file is from a <input> tag or from Drag'n Drop
    // Is the file an image?

    if (!file || !file.type.match(/image.*/)) return;

    // It is!
    // Let's build a FormData object

    var fd = new FormData();
    fd.append("image", file); // Append the file
    fd.append("key", imgurAPIKey);
    // Get your own key: http://api.imgur.com/

    // Create the XHR (Cross-Domain XHR FTW!!!)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://api.imgur.com/2/upload.json"); // Boooom!
    xhr.onload = function () {
        // Big win!
        // The URL of the image is:
        var links = JSON.parse(xhr.responseText).upload.links;
        //{delete_page, imgur_page, large_thumbnail, original, small_square};
        callback(links.original);
    }
    // Ok, I don't handle the errors. An exercice for the reader.
    // And now, we send the formdata
    xhr.send(fd);
}
function createDialogs() {
    $(".dialog").dialog({
        autoOpen: false
    });
    function showBusy() {
        $("#busy").dialog({
            autoOpen: true,
            closeOnEscape: false,
            draggable: false,
            resizable: false,
            modal: true,
            height: 80,
            width: 180
        });
    }
    function hideBusy() {
        $("#busy").dialog("close");
    }
    function showDialog(name, callback) {
        $("#" + name).dialog({
            autoOpen: true,
            closeOnEscape: true,
            minWidth: 500,
            modal: true,
            buttons: {
                "OK": function () {
                    $(this).dialog("close");
                    callback($(this));
                }, "Cancel": function () {
                    $(this).dialog("close");
                    callback(null);
                }
            },
            close: function () {
                $(this).hide();
                callback(false);
            }
        });
    }
    return { showBusy: showBusy, hideBusy: hideBusy, showDialog: showDialog };
}

function createEditor() {
    var editor = new Markdown.Editor(converter);
    var dialogs = createDialogs();
    editor.hooks.chain("onPreviewRefresh", function () {
        app.refreshAllocationsDisplay();
    });
    editor.hooks.set("insertImageDialog", function (callback) {
        dialogs.showDialog("getImage", function formData(data) {
            if (data === false) {
                callback(null);
            } else {
                var files = data.find("input")[0].files; // FileList object
                if (files.length !== 1) {
                    callback(null);
                } else {
                    dialogs.showBusy();
                    upload(files[0], function (url) {
                        dialogs.hideBusy();
                        callback(url);
                    });
                }
            }
        });
        return true; // tell the editor that we'll take care of getting the image url
    });
    editor.run();
}

module.exports = function (item) {
    /// <summary>Loads markdown and displays it in an edit control on ghe page, still in the markdown section.</summary>
    /// <param name="ID" type="String">The ID of the entity to edit markdown for.</param>
    AJAX.markdown.read(item, function (md) {
        $("#markdown").html(template("markdownEdit", { Content: md }))
            .find("form").submit(function (e) {
            var form = e.target;
            var content = form.content.value;
            if (content !== md) {
                setStatus("Saving description");
                AJAX.markdown.update(item.id, content, function (result) {
                    history.go(-1);
                    setStatus("Description saved", 2000);
                });
                return false;
            } else {
                setStatus("Description not changed", 2000);
                history.go(-1);
                return false;
            }
        });

        createEditor();
    });
}
});
require.register("rooms/markdown/converter.js", function(module, exports, require){
var queue = require('queue');
var Markdown = require('../libraries/pagedown.js');

var converter = module.exports = Markdown.getSanitizingConverter();
//Remove http from links display text
converter.hooks.chain("plainLinkText", function (url) {
    return url.replace(/^https?:\/\//, "");
});
//suport using #bang urls
converter.hooks.chain("preConversion", function (text) {
    return text.replace(/\(#(.*)\)/g, "(http://hashurl.com/$1)")
                .replace(/]: #(.*)/g, "]: http://hashurl.com/$1");
});
converter.hooks.chain("postConversion", function (text) {
    return text.replace(/http:\/\/hashurl.com\//g, "#");
});
//support // as line comment
converter.hooks.chain("preConversion", function (text) {
    return text.replace(/((\r\n|\n|\r)\/\/.*$)|(^\/\/.*(\r\n|\n|\r))/gm, "");
});
//Allow insertion of -allocation:roomid-
converter.hooks.chain("postConversion", function (text) {
    return text.replace(/\[allocation:([^\]]*)\]/g, '<span class="allocationDisplay" data-roomid="$1"></span>')
            .replace(/\[allocation-current:([^\]]*)\]/g, '<span class="allocationDisplay" data-roomid="$1" data-year="current"></span>')
            .replace(/\[allocation-next:([^\]]*)\]/g, '<span class="allocationDisplay" data-roomid="$1" data-year="next"></span>');
});
//Allow alignment of images (right or left)
converter.hooks.chain("postConversion", function (text) {
    return text.replace(/\/>\[(left|right|middle|top|bottom)\]/g, 'align="$1" />');
});
converter.hooks.chain("postConversion", function (text) {
    return text.replace(/<\/h1>/g, "</h1><hr>");
});
//Allow a table
(function () {
    var tables = queue();
    converter.hooks.chain("preConversion", function (text) {
        function parseLine(line, tag) {
            return "<tr><" + tag + ">" +
                    line.replace(/^\||\|$/g, "").replace(/\|/g, "</" + tag + "><" + tag + ">")
               + "</" + tag + "></tr>";
        }

        var result = text.replace(/(\r\n|\n|\r)/gm, "\n")
    .replace(
        /^([^\n]*\|[^\n]*)\n[\s-\|]*-[\s-\|]*$/gm,
        function (a, line) {
            return parseLine(line, "th");
        })
        .replace(/^(.*)\|(.*)$/gm, function (line) {
            return parseLine(line, "td");
        })
    .replace(/^\n((?:<tr>[^\n]*\n)+)$/gm, function (u, table) {
            tables.enqueue("<table>" + table + "</table>");
            return "\n\n[table]\n\n";
        });
        return result;
    });
    converter.hooks.chain("postConversion", function (text) {
        return text.replace(/<p>\[table\]<\/p>/gm, tables.dequeue);
    });
}());
});
require.register("rooms/helpers/table.js", function(module, exports, require){
﻿var $ = jQuery;
module.exports = makeTable;
function makeTable(selector) {
    $(selector).find("td").each(function () {
        var self = $(this);

        var input = self.find("input,select");
        if (input.length === 0) {
            return;
        }

        self.dblclick(function () {
            var label = self.find("div");
            label.hide();
            input.show().focus();
        });
        input.blur(function () {
            var label = self.find("div");
            var Name = self.attr("itemprop");
            var ID = self.parents("tr").attr("itemid");
            var Value = input.attr("type")==="number"?Number(input.hide().val()):input.hide().val();
            var OldValue = label.html();
            if (OldValue !== Value) {
                if (callback(ID, Name, Value) === false) {
                    input.val(OldValue);
                    label.show();
                } else {
                    label.show().html(Value);
                }
            } else {
                label.show();
            }
        });
    })
}
});
require.register("rooms/helpers/navigation-item-order.js", function(module, exports, require){
﻿function compareText(a, b) {
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

});
require.register("rooms/helpers/status-display.js", function(module, exports, require){
var base64 = require('base64-encode');
var dateUpdated;
var hasmessage;
var isAuthenticated = undefined;

function next(auth) {
    if (auth.isAuthenticated !== undefined) {
        isAuthenticated = auth.isAuthenticated;
    }
    dateUpdated = new Date();
    if (!hasmessage) {
        clearStatus();
    }
}
function fixLength(num) {
    var str = num.toString();
    var blank = "00";
    return blank.substr(str.length) + str;
}
function timeString() {
    return fixLength(dateUpdated.getHours()) + ":" +
        fixLength(dateUpdated.getMinutes()) + ":" +
        fixLength(dateUpdated.getSeconds());
}


exports.uri = uri;
function uri() {
    return '../user/raven/login/' + base64('rooms/' + location.hash) +
        '/' + base64('rooms/');
}
exports.setStatus = setStatus;
function setStatus(message, timeout) {
    /// <summary>Set a status message to display, with an optional timeout</summary>
    /// <param name="message" type="String">The message to display (can contain html)</param>
    /// <param name="timeout" type="Optional Number">The number of milliseconds before the message disapears</param>
    hasmessage = true;
    $("#status").html(message);
    if (timeout !== undefined) {
        setTimeout(this.clearStatus, timeout);
    }
    return this;
}
exports.clearStatus = clearStatus;
function clearStatus() {
    /// <summary>Clear whatever status messages there are and return to displaying when it was last updated.</summary>
    hasmessage = false;
    if (isAuthenticated) {
        $("#status").html("last updated " + timeString());
    } else {
        $("#status").html('<a  class="login" href="' + uri() + '">Log in to view allocations and edit data</a>');
    }
    return this;
}

clearStatus();
stream.on('auth', next);
stream.on('raw', next);
$("#status").hover(function () {
    if (!isAuthenticated) {
        $("#status a").attr("href", uri());
    }
});
$("#login").hover(function () {
    if (!isAuthenticated) {
        $("#loginButton").attr("href", uri());
    }
});
});
require.register("rooms/libraries/pagedown.js", function(module, exports, require){
exports = false;
require = null;
//Markdown.converter
var Markdown; if (typeof require === "function") { Markdown = exports } else { Markdown = {} } (function () { function c(e) { return e } function d(e) { return false } function b() { } b.prototype = { chain: function (g, f) { var e = this[g]; if (!e) { throw new Error("unknown hook " + g) } if (e === c) { this[g] = f } else { this[g] = function (h) { return f(e(h)) } } }, set: function (f, e) { if (!this[f]) { throw new Error("unknown hook " + f) } this[f] = e }, addNoop: function (e) { this[e] = c }, addFalse: function (e) { this[e] = d } }; Markdown.HookCollection = b; function a() { } a.prototype = { set: function (e, f) { this["s_" + e] = f }, get: function (e) { return this["s_" + e] } }; Markdown.Converter = function () { var j = this.hooks = new b(); j.addNoop("plainLinkText"); j.addNoop("preConversion"); j.addNoop("postConversion"); var w; var n; var e; var z; this.makeHtml = function (P) { if (w) { throw new Error("Recursive call to converter.makeHtml") } w = new a(); n = new a(); e = []; z = 0; P = j.preConversion(P); P = P.replace(/~/g, "~T"); P = P.replace(/\$/g, "~D"); P = P.replace(/\r\n/g, "\n"); P = P.replace(/\r/g, "\n"); P = "\n\n" + P + "\n\n"; P = J(P); P = P.replace(/^[ \t]+$/mg, ""); P = o(P); P = m(P); P = f(P); P = M(P); P = P.replace(/~D/g, "$$"); P = P.replace(/~T/g, "~"); P = j.postConversion(P); e = n = w = null; return P }; function m(P) { P = P.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm, function (S, U, T, R, Q, V) { U = U.toLowerCase(); w.set(U, C(T)); if (Q) { return R } else { if (V) { n.set(U, V.replace(/"/g, "&quot;")) } } return "" }); return P } function o(R) { var Q = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"; var P = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"; R = R.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, O); R = R.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, O); R = R.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, O); R = R.replace(/\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g, O); R = R.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, O); return R } function O(P, Q) { var R = Q; R = R.replace(/^\n+/, ""); R = R.replace(/\n+$/g, ""); R = "\n\n~K" + (e.push(R) - 1) + "K\n\n"; return R } function f(R, Q) { R = i(R); var P = "<hr />\n"; R = R.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, P); R = R.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, P); R = R.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, P); R = L(R); R = q(R); R = g(R); R = o(R); R = I(R, Q); return R } function k(P) { P = r(P); P = v(P); P = H(P); P = D(P); P = E(P); P = K(P); P = P.replace(/~P/g, "://"); P = C(P); P = x(P); P = P.replace(/  +\n/g, " <br>\n"); return P } function v(Q) { var P = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>)/gi; Q = Q.replace(P, function (S) { var R = S.replace(/(.)<\/?code>(?=.)/g, "$1`"); R = y(R, S.charAt(1) == "!" ? "\\`*_/" : "\\`*_"); return R }); return Q } function E(P) { P = P.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, h); P = P.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?((?:\([^)]*\)|[^()])*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, h); P = P.replace(/(\[([^\[\]]+)\])()()()()()/g, h); return P } function h(V, ab, aa, Z, Y, X, U, T) { if (T == undefined) { T = "" } var S = ab; var Q = aa.replace(/:\/\//g, "~P"); var R = Z.toLowerCase(); var P = Y; var W = T; if (P == "") { if (R == "") { R = Q.toLowerCase().replace(/ ?\n/g, " ") } P = "#" + R; if (w.get(R) != undefined) { P = w.get(R); if (n.get(R) != undefined) { W = n.get(R) } } else { if (S.search(/\(\s*\)$/m) > -1) { P = "" } else { return S } } } P = A(P); P = y(P, "*_"); var ac = '<a href="' + P + '"'; if (W != "") { W = G(W); W = y(W, "*_"); ac += ' title="' + W + '"' } ac += ">" + Q + "</a>"; return ac } function D(P) { P = P.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, F); P = P.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, F); return P } function G(P) { return P.replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;") } function F(V, ab, aa, Z, Y, X, U, T) { var S = ab; var R = aa; var Q = Z.toLowerCase(); var P = Y; var W = T; if (!W) { W = "" } if (P == "") { if (Q == "") { Q = R.toLowerCase().replace(/ ?\n/g, " ") } P = "#" + Q; if (w.get(Q) != undefined) { P = w.get(Q); if (n.get(Q) != undefined) { W = n.get(Q) } } else { return S } } R = y(G(R), "*_[]()"); P = y(P, "*_"); var ac = '<img src="' + P + '" alt="' + R + '"'; W = G(W); W = y(W, "*_"); ac += ' title="' + W + '"'; ac += " />"; return ac } function i(P) { P = P.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm, function (Q, R) { return "<h1>" + k(R) + "</h1>\n\n" }); P = P.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm, function (R, Q) { return "<h2>" + k(Q) + "</h2>\n\n" }); P = P.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm, function (Q, T, S) { var R = T.length; return "<h" + R + ">" + k(S) + "</h" + R + ">\n\n" }); return P } function L(Q) { Q += "~0"; var P = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm; if (z) { Q = Q.replace(P, function (S, V, U) { var W = V; var T = (U.search(/[*+-]/g) > -1) ? "ul" : "ol"; var R = l(W, T); R = R.replace(/\s+$/, ""); R = "<" + T + ">" + R + "</" + T + ">\n"; return R }) } else { P = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g; Q = Q.replace(P, function (T, X, V, S) { var W = X; var Y = V; var U = (S.search(/[*+-]/g) > -1) ? "ul" : "ol"; var R = l(Y, U); R = W + "<" + U + ">\n" + R + "</" + U + ">\n"; return R }) } Q = Q.replace(/~0/, ""); return Q } var p = { ol: "\\d+[.]", ul: "[*+-]" }; function l(R, Q) { z++; R = R.replace(/\n{2,}$/, "\n"); R += "~0"; var P = p[Q]; var S = new RegExp("(^[ \\t]*)(" + P + ")[ \\t]+([^\\r]+?(\\n+))(?=(~0|\\1(" + P + ")[ \\t]+))", "gm"); var T = false; R = R.replace(S, function (V, X, W, U) { var aa = U; var ab = X; var Z = /\n\n$/.test(aa); var Y = Z || aa.search(/\n{2,}/) > -1; if (Y || T) { aa = f(t(aa), true) } else { aa = L(t(aa)); aa = aa.replace(/\n$/, ""); aa = k(aa) } T = Z; return "<li>" + aa + "</li>\n" }); R = R.replace(/~0/g, ""); z--; return R } function q(P) { P += "~0"; P = P.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g, function (Q, S, R) { var T = S; var U = R; T = B(t(T)); T = J(T); T = T.replace(/^\n+/g, ""); T = T.replace(/\n+$/g, ""); T = "<pre><code>" + T + "\n</code></pre>"; return "\n\n" + T + "\n\n" + U }); P = P.replace(/~0/, ""); return P } function N(P) { P = P.replace(/(^\n+|\n+$)/g, ""); return "\n\n~K" + (e.push(P) - 1) + "K\n\n" } function r(P) { P = P.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, function (S, U, T, R, Q) { var V = R; V = V.replace(/^([ \t]*)/g, ""); V = V.replace(/[ \t]*$/g, ""); V = B(V); V = V.replace(/:\/\//g, "~P"); return U + "<code>" + V + "</code>" }); return P } function B(P) { P = P.replace(/&/g, "&amp;"); P = P.replace(/</g, "&lt;"); P = P.replace(/>/g, "&gt;"); P = y(P, "*_{}[]\\", false); return P } function x(P) { P = P.replace(/([\W_]|^)(\*\*|__)(?=\S)([^\r]*?\S[\*_]*)\2([\W_]|$)/g, "$1<strong>$3</strong>$4"); P = P.replace(/([\W_]|^)(\*|_)(?=\S)([^\r\*_]*?\S)\2([\W_]|$)/g, "$1<em>$3</em>$4"); return P } function g(P) { P = P.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm, function (Q, R) { var S = R; S = S.replace(/^[ \t]*>[ \t]?/gm, "~0"); S = S.replace(/~0/g, ""); S = S.replace(/^[ \t]+$/gm, ""); S = f(S); S = S.replace(/(^|\n)/g, "$1  "); S = S.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (T, U) { var V = U; V = V.replace(/^  /mg, "~0"); V = V.replace(/~0/g, ""); return V }); return N("<blockquote>\n" + S + "\n</blockquote>") }); return P } function I(W, P) { W = W.replace(/^\n+/g, ""); W = W.replace(/\n+$/g, ""); var X = W.split(/\n{2,}/g); var U = []; var Q = /~K(\d+)K/; var R = X.length; for (var S = 0; S < R; S++) { var T = X[S]; if (Q.test(T)) { U.push(T) } else { if (/\S/.test(T)) { T = k(T); T = T.replace(/^([ \t]*)/g, "<p>"); T += "</p>"; U.push(T) } } } if (!P) { R = U.length; for (var S = 0; S < R; S++) { var V = true; while (V) { V = false; U[S] = U[S].replace(/~K(\d+)K/g, function (Y, Z) { V = true; return e[Z] }) } } } return U.join("\n\n") } function C(P) { P = P.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;"); P = P.replace(/<(?![a-z\/?\$!])/gi, "&lt;"); return P } function H(P) { P = P.replace(/\\(\\)/g, s); P = P.replace(/\\([`*_{}\[\]()>#+-.!])/g, s); return P } function K(Q) { Q = Q.replace(/(^|\s)(https?|ftp)(:\/\/[-A-Z0-9+&@#\/%?=~_|\[\]\(\)!:,\.;]*[-A-Z0-9+&@#\/%=~_|\[\]])($|\W)/gi, "$1<$2$3>$4"); var P = function (S, R) { return '<a href="' + R + '">' + j.plainLinkText(R) + "</a>" }; Q = Q.replace(/<((https?|ftp):[^'">\s]+)>/gi, P); return Q } function M(P) { P = P.replace(/~E(\d+)E/g, function (Q, S) { var R = parseInt(S); return String.fromCharCode(R) }); return P } function t(P) { P = P.replace(/^(\t|[ ]{1,4})/gm, "~0"); P = P.replace(/~0/g, ""); return P } function J(S) { if (!/\t/.test(S)) { return S } var R = ["    ", "   ", "  ", " "], Q = 0, P; return S.replace(/[\n\t]/g, function (T, U) { if (T === "\n") { Q = U + 1; return T } P = (U - Q) % 4; Q = U + 1; return R[P] }) } var u = /(?:["'*()[\]:]|~D)/g; function A(Q) { if (!Q) { return "" } var P = Q.length; return Q.replace(u, function (R, S) { if (R == "~D") { return "%24" } if (R == ":") { if (S == P - 1 || /[0-9\/]/.test(Q.charAt(S + 1))) { return ":" } } return "%" + R.charCodeAt(0).toString(16) }) } function y(T, Q, R) { var P = "([" + Q.replace(/([\[\]\\])/g, "\\$1") + "])"; if (R) { P = "\\\\" + P } var S = new RegExp(P, "g"); T = T.replace(S, s); return T } function s(P, R) { var Q = R.charCodeAt(0); return "~E" + Q + "E" } } })();

//Markdown.sanitizer
(function () { var a, d; if (typeof exports === "object" && typeof require === "function") { a = exports; d = require("./Markdown.Converter").Converter } else { a = Markdown; d = a.Converter } a.getSanitizingConverter = function () { var i = new d(); i.hooks.chain("postConversion", c); i.hooks.chain("postConversion", b); return i }; function c(i) { return i.replace(/<[^>]*>?/gi, e) } var f = /^(<\/?(b|blockquote|code|del|dd|dl|dt|em|h1|h2|h3|i|kbd|li|ol|p|pre|s|sup|sub|strong|strike|ul)>|<(br|hr)\s?\/?>)$/i; var g = /^(<a\shref="((https?|ftp):\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)]+"(\stitle="[^"<>]+")?\s?>|<\/a>)$/i; var h = /^(<img\ssrc="(https?:\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)]+"(\swidth="\d{1,3}")?(\sheight="\d{1,3}")?(\salt="[^"<>]*")?(\stitle="[^"<>]*")?\s?\/?>)$/i; function e(i) { if (i.match(f) || i.match(g) || i.match(h)) { return i } else { return "" } } function b(m) { if (m == "") { return "" } var s = /<\/?\w+[^>]*(\s|$|>)/g; var t = m.toLowerCase().match(s); var r = (t || []).length; if (r == 0) { return m } var q, u; var p = "<p><img><br><li><hr>"; var n; var o = []; var j = []; var l = false; for (var i = 0; i < r; i++) { q = t[i].replace(/<\/?(\w+).*/, "$1"); if (o[i] || p.search("<" + q + ">") > -1) { continue } u = t[i]; n = -1; if (!/^<\//.test(u)) { for (var k = i + 1; k < r; k++) { if (!o[k] && t[k] == "</" + q + ">") { n = k; break } } } if (n == -1) { l = j[i] = true } else { o[n] = true } } if (!l) { return m } var i = 0; m = m.replace(s, function (v) { var w = j[i] ? "" : v; i++; return w }); return m } })();

//Markdown.editor
(function () { var a = {}, s = {}, l = {}, u = window.document, m = window.RegExp, g = window.navigator, o = { lineLength: 72 }, t = { isIE: /msie/.test(g.userAgent.toLowerCase()), isIE_5or6: /msie 6/.test(g.userAgent.toLowerCase()) || /msie 5/.test(g.userAgent.toLowerCase()), isOpera: /opera/.test(g.userAgent.toLowerCase()) }; var v = '<p><b>Insert Hyperlink</b></p><p>http://example.com/ "optional title"</p>'; var p = "<p><b>Insert Image</b></p><p>http://example.com/images/diagram.jpg \"optional title\"<br><br>Need <a href='http://www.google.com/search?q=free+image+hosting' target='_blank'>free image hosting?</a></p>"; var c = "http://"; var d = "http://"; var j = "Markdown Editing Help"; Markdown.Editor = function (z, B, y) { B = B || ""; var w = this.hooks = new Markdown.HookCollection(); w.addNoop("onPreviewRefresh"); w.addNoop("postBlockquoteCreation"); w.addFalse("insertImageDialog"); this.getConverter = function () { return z }; var A = this, x; this.run = function () { if (x) { return } x = new i(B); var E = new k(w); var C = new h(z, x, function () { w.onPreviewRefresh() }); var F, D; if (!/\?noundo/.test(u.location.href)) { F = new e(function () { C.refresh(); if (D) { D.setUndoRedoButtonStates() } }, x) } D = new q(B, x, F, C, E, y); D.setUndoRedoButtonStates(); var G = A.refreshPreview = function () { C.refresh(true) }; G() } }; function r() { } r.prototype.findTags = function (x, z) { var w = this; var y; if (x) { y = a.extendRegExp(x, "", "$"); this.before = this.before.replace(y, function (A) { w.startTag = w.startTag + A; return "" }); y = a.extendRegExp(x, "^", ""); this.selection = this.selection.replace(y, function (A) { w.startTag = w.startTag + A; return "" }) } if (z) { y = a.extendRegExp(z, "", "$"); this.selection = this.selection.replace(y, function (A) { w.endTag = A + w.endTag; return "" }); y = a.extendRegExp(z, "^", ""); this.after = this.after.replace(y, function (A) { w.endTag = A + w.endTag; return "" }) } }; r.prototype.trimWhitespace = function (x) { var w, z, y = this; if (x) { w = z = "" } else { w = function (A) { y.before += A; return "" }; z = function (A) { y.after = A + y.after; return "" } } this.selection = this.selection.replace(/^(\s*)/, w).replace(/(\s*)$/, z) }; r.prototype.skipLines = function (y, x, w) { if (y === undefined) { y = 1 } if (x === undefined) { x = 1 } y++; x++; var z; var A; if (navigator.userAgent.match(/Chrome/)) { "X".match(/()./) } this.selection = this.selection.replace(/(^\n*)/, ""); this.startTag = this.startTag + m.$1; this.selection = this.selection.replace(/(\n*$)/, ""); this.endTag = this.endTag + m.$1; this.startTag = this.startTag.replace(/(^\n*)/, ""); this.before = this.before + m.$1; this.endTag = this.endTag.replace(/(\n*$)/, ""); this.after = this.after + m.$1; if (this.before) { z = A = ""; while (y--) { z += "\\n?"; A += "\n" } if (w) { z = "\\n*" } this.before = this.before.replace(new m(z + "$", ""), A) } if (this.after) { z = A = ""; while (x--) { z += "\\n?"; A += "\n" } if (w) { z = "\\n*" } this.after = this.after.replace(new m(z, ""), A) } }; function i(w) { this.buttonBar = u.getElementById("wmd-button-bar" + w); this.preview = u.getElementById("wmd-preview" + w); this.input = u.getElementById("wmd-input" + w) } a.isVisible = function (w) { if (window.getComputedStyle) { return window.getComputedStyle(w, null).getPropertyValue("display") !== "none" } else { if (w.currentStyle) { return w.currentStyle.display !== "none" } } }; a.addEvent = function (x, w, y) { if (x.attachEvent) { x.attachEvent("on" + w, y) } else { x.addEventListener(w, y, false) } }; a.removeEvent = function (x, w, y) { if (x.detachEvent) { x.detachEvent("on" + w, y) } else { x.removeEventListener(w, y, false) } }; a.fixEolChars = function (w) { w = w.replace(/\r\n/g, "\n"); w = w.replace(/\r/g, "\n"); return w }; a.extendRegExp = function (y, A, x) { if (A === null || A === undefined) { A = "" } if (x === null || x === undefined) { x = "" } var z = y.toString(); var w; z = z.replace(/\/([gim]*)$/, ""); w = m.$1; z = z.replace(/(^\/|\/$)/g, ""); z = A + z + x; return new m(z, w) }; s.getTop = function (y, x) { var w = y.offsetTop; if (!x) { while (y = y.offsetParent) { w += y.offsetTop } } return w }; s.getHeight = function (w) { return w.offsetHeight || w.scrollHeight }; s.getWidth = function (w) { return w.offsetWidth || w.scrollWidth }; s.getPageSize = function () { var x, y; var w, B; if (self.innerHeight && self.scrollMaxY) { x = u.body.scrollWidth; y = self.innerHeight + self.scrollMaxY } else { if (u.body.scrollHeight > u.body.offsetHeight) { x = u.body.scrollWidth; y = u.body.scrollHeight } else { x = u.body.offsetWidth; y = u.body.offsetHeight } } if (self.innerHeight) { w = self.innerWidth; B = self.innerHeight } else { if (u.documentElement && u.documentElement.clientHeight) { w = u.documentElement.clientWidth; B = u.documentElement.clientHeight } else { if (u.body) { w = u.body.clientWidth; B = u.body.clientHeight } } } var A = Math.max(x, w); var z = Math.max(y, B); return [A, z, w, B] }; function e(I, F) { var L = this; var G = []; var D = 0; var C = "none"; var x; var y; var B; var w = function (N, M) { if (C != N) { C = N; if (!M) { z() } } if (!t.isIE || C != "moving") { y = setTimeout(E, 1) } else { B = null } }; var E = function (M) { B = new b(F, M); y = undefined }; this.setCommandMode = function () { C = "command"; z(); y = setTimeout(E, 0) }; this.canUndo = function () { return D > 1 }; this.canRedo = function () { if (G[D + 1]) { return true } return false }; this.undo = function () { if (L.canUndo()) { if (x) { x.restore(); x = null } else { G[D] = new b(F); G[--D].restore(); if (I) { I() } } } C = "none"; F.input.focus(); E() }; this.redo = function () { if (L.canRedo()) { G[++D].restore(); if (I) { I() } } C = "none"; F.input.focus(); E() }; var z = function () { var M = B || new b(F); if (!M) { return false } if (C == "moving") { if (!x) { x = M } return } if (x) { if (G[D - 1].text != x.text) { G[D++] = x } x = null } G[D++] = M; G[D + 1] = null; if (I) { I() } }; var H = function (M) { var O = false; if (M.ctrlKey || M.metaKey) { var N = M.charCode || M.keyCode; var P = String.fromCharCode(N); switch (P) { case "y": L.redo(); O = true; break; case "z": if (!M.shiftKey) { L.undo() } else { L.redo() } O = true; break } } if (O) { if (M.preventDefault) { M.preventDefault() } if (window.event) { window.event.returnValue = false } return } }; var K = function (M) { if (!M.ctrlKey && !M.metaKey) { var N = M.keyCode; if ((N >= 33 && N <= 40) || (N >= 63232 && N <= 63235)) { w("moving") } else { if (N == 8 || N == 46 || N == 127) { w("deleting") } else { if (N == 13) { w("newlines") } else { if (N == 27) { w("escape") } else { if ((N < 16 || N > 20) && N != 91) { w("typing") } } } } } } }; var A = function () { a.addEvent(F.input, "keypress", function (N) { if ((N.ctrlKey || N.metaKey) && (N.keyCode == 89 || N.keyCode == 90)) { N.preventDefault() } }); var M = function () { if (t.isIE || (B && B.text != F.input.value)) { if (y == undefined) { C = "paste"; z(); E() } } }; a.addEvent(F.input, "keydown", H); a.addEvent(F.input, "keydown", K); a.addEvent(F.input, "mousedown", function () { w("moving") }); F.input.onpaste = M; F.input.ondrop = M }; var J = function () { A(); E(true); z() }; J() } function b(x, z) { var w = this; var y = x.input; this.init = function () { if (!a.isVisible(y)) { return } if (!z && u.activeElement && u.activeElement !== y) { return } this.setInputAreaSelectionStartEnd(); this.scrollTop = y.scrollTop; if (!this.text && y.selectionStart || y.selectionStart === 0) { this.text = y.value } }; this.setInputAreaSelection = function () { if (!a.isVisible(y)) { return } if (y.selectionStart !== undefined && !t.isOpera) { y.focus(); y.selectionStart = w.start; y.selectionEnd = w.end; y.scrollTop = w.scrollTop } else { if (u.selection) { if (u.activeElement && u.activeElement !== y) { return } y.focus(); var A = y.createTextRange(); A.moveStart("character", -y.value.length); A.moveEnd("character", -y.value.length); A.moveEnd("character", w.end); A.moveStart("character", w.start); A.select() } } }; this.setInputAreaSelectionStartEnd = function () { if (!x.ieCachedRange && (y.selectionStart || y.selectionStart === 0)) { w.start = y.selectionStart; w.end = y.selectionEnd } else { if (u.selection) { w.text = a.fixEolChars(y.value); var D = x.ieCachedRange || u.selection.createRange(); var E = a.fixEolChars(D.text); var C = "\x07"; var B = C + E + C; D.text = B; var F = a.fixEolChars(y.value); D.moveStart("character", -B.length); D.text = E; w.start = F.indexOf(C); w.end = F.lastIndexOf(C) - C.length; var A = w.text.length - a.fixEolChars(y.value).length; if (A) { D.moveStart("character", -E.length); while (A--) { E += "\n"; w.end += 1 } D.text = E } if (x.ieCachedRange) { w.scrollTop = x.ieCachedScrollTop } x.ieCachedRange = null; this.setInputAreaSelection() } } }; this.restore = function () { if (w.text != undefined && w.text != y.value) { y.value = w.text } this.setInputAreaSelection(); y.scrollTop = w.scrollTop }; this.getChunks = function () { var A = new r(); A.before = a.fixEolChars(w.text.substring(0, w.start)); A.startTag = ""; A.selection = a.fixEolChars(w.text.substring(w.start, w.end)); A.endTag = ""; A.after = a.fixEolChars(w.text.substring(w.end)); A.scrollTop = w.scrollTop; return A }; this.setChunks = function (A) { A.before = A.before + A.startTag; A.after = A.endTag + A.after; this.start = A.before.length; this.end = A.before.length + A.selection.length; this.text = A.before + A.selection + A.after; this.scrollTop = A.scrollTop }; this.init() } function h(Q, z, K) { var x = this; var E; var D; var N; var y = 3000; var F = "delayed"; var B = function (S, T) { a.addEvent(S, "input", T); S.onpaste = T; S.ondrop = T; a.addEvent(S, "keypress", T); a.addEvent(S, "keydown", T) }; var J = function () { var S = 0; if (window.innerHeight) { S = window.pageYOffset } else { if (u.documentElement && u.documentElement.scrollTop) { S = u.documentElement.scrollTop } else { if (u.body) { S = u.body.scrollTop } } } return S }; var C = function () { if (!z.preview) { return } var U = z.input.value; if (U && U == N) { return } else { N = U } var T = new Date().getTime(); U = Q.makeHtml(U); var S = new Date().getTime(); D = S - T; w(U) }; var P = function () { if (E) { clearTimeout(E); E = undefined } if (F !== "manual") { var S = 0; if (F === "delayed") { S = D } if (S > y) { S = y } E = setTimeout(C, S) } }; var A = function (S) { if (S.scrollHeight <= S.clientHeight) { return 1 } return S.scrollTop / (S.scrollHeight - S.clientHeight) }; var R = function () { if (z.preview) { z.preview.scrollTop = (z.preview.scrollHeight - z.preview.clientHeight) * A(z.preview) } }; this.refresh = function (S) { if (S) { N = ""; C() } else { P() } }; this.processingTime = function () { return D }; var G = true; var H = function (V) { var U = z.preview; var T = U.parentNode; var S = U.nextSibling; T.removeChild(U); U.innerHTML = V; if (!S) { T.appendChild(U) } else { T.insertBefore(U, S) } }; var M = function (S) { z.preview.innerHTML = S }; var I; var L = function (T) { if (I) { return I(T) } try { M(T); I = M } catch (S) { I = H; I(T) } }; var w = function (U) { var S = s.getTop(z.input) - J(); if (z.preview) { L(U); K() } R(); if (G) { G = false; return } var T = s.getTop(z.input) - J(); if (t.isIE) { setTimeout(function () { window.scrollBy(0, T - S) }, 0) } else { window.scrollBy(0, T - S) } }; var O = function () { B(z.input, P); C(); if (z.preview) { z.preview.scrollTop = 0 } }; O() } l.createBackground = function () { var x = u.createElement("div"), y = x.style; x.className = "wmd-prompt-background"; y.position = "absolute"; y.top = "0"; y.zIndex = "1000"; if (t.isIE) { y.filter = "alpha(opacity=50)" } else { y.opacity = "0.5" } var w = s.getPageSize(); y.height = w[1] + "px"; if (t.isIE) { y.left = u.documentElement.scrollLeft; y.width = u.documentElement.clientWidth } else { y.left = "0"; y.width = "100%" } u.body.appendChild(x); return x }; l.prompt = function (B, z, D) { var y; var x; if (z === undefined) { z = "" } var C = function (E) { var F = (E.charCode || E.keyCode); if (F === 27) { A(true) } }; var A = function (E) { a.removeEvent(u.body, "keydown", C); var F = x.value; if (E) { F = null } else { F = F.replace("http://http://", "http://"); F = F.replace("http://https://", "https://"); F = F.replace("http://ftp://", "ftp://"); if (F.indexOf("http://") === -1 && F.indexOf("ftp://") === -1 && F.indexOf("https://") === -1) { F = "http://" + F } } y.parentNode.removeChild(y); D(F); return false }; var w = function () { y = u.createElement("div"); y.className = "wmd-prompt-dialog"; y.style.padding = "10px;"; y.style.position = "fixed"; y.style.width = "400px"; y.style.zIndex = "1001"; var E = u.createElement("div"); E.innerHTML = B; E.style.padding = "5px"; y.appendChild(E); var G = u.createElement("form"), F = G.style; G.onsubmit = function () { return A(false) }; F.padding = "0"; F.margin = "0"; F.cssFloat = "left"; F.width = "100%"; F.textAlign = "center"; F.position = "relative"; y.appendChild(G); x = u.createElement("input"); x.type = "text"; x.value = z; F = x.style; F.display = "block"; F.width = "80%"; F.marginLeft = F.marginRight = "auto"; G.appendChild(x); var I = u.createElement("input"); I.type = "button"; I.onclick = function () { return A(false) }; I.value = "OK"; F = I.style; F.margin = "10px"; F.display = "inline"; F.width = "7em"; var H = u.createElement("input"); H.type = "button"; H.onclick = function () { return A(true) }; H.value = "Cancel"; F = H.style; F.margin = "10px"; F.display = "inline"; F.width = "7em"; G.appendChild(I); G.appendChild(H); a.addEvent(u.body, "keydown", C); y.style.top = "50%"; y.style.left = "50%"; y.style.display = "block"; if (t.isIE_5or6) { y.style.position = "absolute"; y.style.top = u.documentElement.scrollTop + 200 + "px"; y.style.left = "50%" } u.body.appendChild(y); y.style.marginTop = -(s.getHeight(y) / 2) + "px"; y.style.marginLeft = -(s.getWidth(y) / 2) + "px" }; setTimeout(function () { w(); var F = z.length; if (x.selectionStart !== undefined) { x.selectionStart = 0; x.selectionEnd = F } else { if (x.createTextRange) { var E = x.createTextRange(); E.collapse(false); E.moveStart("character", -F); E.moveEnd("character", F); E.select() } } x.focus() }, 0) }; function q(H, C, J, y, G, B) { var A = C.input, E = {}; z(); var D = "keydown"; if (t.isOpera) { D = "keypress" } a.addEvent(A, D, function (L) { if ((L.ctrlKey || L.metaKey) && !L.altKey) { var M = L.charCode || L.keyCode; var K = String.fromCharCode(M).toLowerCase(); switch (K) { case "b": I(E.bold); break; case "i": I(E.italic); break; case "l": I(E.link); break; case "q": I(E.quote); break; case "k": I(E.code); break; case "g": I(E.image); break; case "o": I(E.olist); break; case "u": I(E.ulist); break; case "h": I(E.heading); break; case "r": I(E.hr); break; case "y": I(E.redo); break; case "z": if (L.shiftKey) { I(E.redo) } else { I(E.undo) } break; default: return } if (L.preventDefault) { L.preventDefault() } if (window.event) { window.event.returnValue = false } } }); a.addEvent(A, "keyup", function (K) { if (K.shiftKey && !K.ctrlKey && !K.metaKey) { var L = K.charCode || K.keyCode; if (L === 13) { fakeButton = {}; fakeButton.textOp = x("doAutoindent"); I(fakeButton) } } }); if (t.isIE) { a.addEvent(A, "keydown", function (K) { var L = K.keyCode; if (L === 27) { return false } }) } function I(L) { A.focus(); if (L.textOp) { if (J) { J.setCommandMode() } var N = new b(C); if (!N) { return } var O = N.getChunks(); var K = function () { A.focus(); if (O) { N.setChunks(O) } N.restore(); y.refresh() }; var M = L.textOp(O, K); if (!M) { K() } } if (L.execute) { L.execute(J) } } function w(K, M) { var N = "0px"; var P = "-20px"; var L = "-40px"; var O = K.getElementsByTagName("span")[0]; if (M) { O.style.backgroundPosition = K.XShift + " " + N; K.onmouseover = function () { O.style.backgroundPosition = this.XShift + " " + L }; K.onmouseout = function () { O.style.backgroundPosition = this.XShift + " " + N }; if (t.isIE) { K.onmousedown = function () { if (u.activeElement && u.activeElement !== C.input) { return } C.ieCachedRange = document.selection.createRange(); C.ieCachedScrollTop = C.input.scrollTop } } if (!K.isHelp) { K.onclick = function () { if (this.onmouseout) { this.onmouseout() } I(this); return false } } } else { O.style.backgroundPosition = K.XShift + " " + P; K.onmouseover = K.onmouseout = K.onclick = function () { } } } function x(K) { if (typeof K === "string") { K = G[K] } return function () { K.apply(G, arguments) } } function z() { var O = C.buttonBar; var S = "0px"; var N = "-20px"; var Q = "-40px"; var R = document.createElement("ul"); R.id = "wmd-button-row" + H; R.className = "wmd-button-row"; R = O.appendChild(R); var K = 0; var T = function (aa, Y, X, Z) { var W = document.createElement("li"); W.className = "wmd-button"; W.style.left = K + "px"; K += 25; var V = document.createElement("span"); W.id = aa + H; W.appendChild(V); W.title = Y; W.XShift = X; if (Z) { W.textOp = Z } w(W, true); R.appendChild(W); return W }; var M = function (W) { var V = document.createElement("li"); V.className = "wmd-spacer wmd-spacer" + W; V.id = "wmd-spacer" + W + H; R.appendChild(V); K += 25 }; E.bold = T("wmd-bold-button", "Strong <strong> Ctrl+B", "0px", x("doBold")); E.italic = T("wmd-italic-button", "Emphasis <em> Ctrl+I", "-20px", x("doItalic")); M(1); E.link = T("wmd-link-button", "Hyperlink <a> Ctrl+L", "-40px", x(function (V, W) { return this.doLinkOrImage(V, W, false) })); E.quote = T("wmd-quote-button", "Blockquote <blockquote> Ctrl+Q", "-60px", x("doBlockquote")); E.code = T("wmd-code-button", "Code Sample <pre><code> Ctrl+K", "-80px", x("doCode")); E.image = T("wmd-image-button", "Image <img> Ctrl+G", "-100px", x(function (V, W) { return this.doLinkOrImage(V, W, true) })); M(2); E.olist = T("wmd-olist-button", "Numbered List <ol> Ctrl+O", "-120px", x(function (V, W) { this.doList(V, W, true) })); E.ulist = T("wmd-ulist-button", "Bulleted List <ul> Ctrl+U", "-140px", x(function (V, W) { this.doList(V, W, false) })); E.heading = T("wmd-heading-button", "Heading <h1>/<h2> Ctrl+H", "-160px", x("doHeading")); E.hr = T("wmd-hr-button", "Horizontal Rule <hr> Ctrl+R", "-180px", x("doHorizontalRule")); M(3); E.undo = T("wmd-undo-button", "Undo - Ctrl+Z", "-200px", null); E.undo.execute = function (V) { if (V) { V.undo() } }; var U = /win/.test(g.platform.toLowerCase()) ? "Redo - Ctrl+Y" : "Redo - Ctrl+Shift+Z"; E.redo = T("wmd-redo-button", U, "-220px", null); E.redo.execute = function (V) { if (V) { V.redo() } }; if (B) { var P = document.createElement("li"); var L = document.createElement("span"); P.appendChild(L); P.className = "wmd-button wmd-help-button"; P.id = "wmd-help-button" + H; P.XShift = "-240px"; P.isHelp = true; P.style.right = "0px"; P.title = B.title || j; P.onclick = B.handler; w(P, true); R.appendChild(P); E.help = P } F() } function F() { if (J) { w(E.undo, J.canUndo()); w(E.redo, J.canRedo()) } } this.setUndoRedoButtonStates = F } function k(w) { this.hooks = w } var f = k.prototype; f.prefixes = "(?:\\s{4,}|\\s*>|\\s*-\\s+|\\s*\\d+\\.|=|\\+|-|_|\\*|#|\\s*\\[[^\n]]+\\]:)"; f.unwrap = function (x) { var w = new m("([^\\n])\\n(?!(\\n|" + this.prefixes + "))", "g"); x.selection = x.selection.replace(w, "$1 $2") }; f.wrap = function (x, w) { this.unwrap(x); var z = new m("(.{1," + w + "})( +|$\\n?)", "gm"), y = this; x.selection = x.selection.replace(z, function (A, B) { if (new m("^" + y.prefixes, "").test(A)) { return A } return B + "\n" }); x.selection = x.selection.replace(/\s+$/, "") }; f.doBold = function (w, x) { return this.doBorI(w, x, 2, "strong text") }; f.doItalic = function (w, x) { return this.doBorI(w, x, 1, "emphasized text") }; f.doBorI = function (C, A, B, w) { C.trimWhitespace(); C.selection = C.selection.replace(/\n{2,}/g, "\n"); var z = /(\**$)/.exec(C.before)[0]; var x = /(^\**)/.exec(C.after)[0]; var D = Math.min(z.length, x.length); if ((D >= B) && (D != 2 || B != 1)) { C.before = C.before.replace(m("[*]{" + B + "}$", ""), ""); C.after = C.after.replace(m("^[*]{" + B + "}", ""), "") } else { if (!C.selection && x) { C.after = C.after.replace(/^([*_]*)/, ""); C.before = C.before.replace(/(\s?)$/, ""); var y = m.$1; C.before = C.before + x + y } else { if (!C.selection && !x) { C.selection = w } var E = B <= 1 ? "*" : "**"; C.before = C.before + E; C.after = E + C.after } } return }; f.stripLinkDefs = function (x, w) { x = x.replace(/^[ ]{0,3}\[(\d+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|$)/gm, function (B, C, y, z, A) { w[C] = B.replace(/\s*$/, ""); if (z) { w[C] = B.replace(/["(](.+?)[")]$/, ""); return z + A } return "" }); return x }; f.addLinkDef = function (D, z) { var w = 0; var y = {}; D.before = this.stripLinkDefs(D.before, y); D.selection = this.stripLinkDefs(D.selection, y); D.after = this.stripLinkDefs(D.after, y); var x = ""; var C = /(\[)((?:\[[^\]]*\]|[^\[\]])*)(\][ ]?(?:\n[ ]*)?\[)(\d+)(\])/g; var B = function (F) { w++; F = F.replace(/^[ ]{0,3}\[(\d+)\]:/, "  [" + w + "]:"); x += "\n" + F }; var A = function (G, J, H, I, K, F) { H = H.replace(C, A); if (y[K]) { B(y[K]); return J + H + I + w + F } return G }; D.before = D.before.replace(C, A); if (z) { B(z) } else { D.selection = D.selection.replace(C, A) } var E = w; D.after = D.after.replace(C, A); if (D.after) { D.after = D.after.replace(/\n*$/, "") } if (!D.after) { D.selection = D.selection.replace(/\n*$/, "") } D.after += "\n\n" + x; return E }; function n(w) { return w.replace(/^\s*(.*?)(?:\s+"(.+)")?\s*$/, function (y, x, z) { x = x.replace(/\?.*$/, function (A) { return A.replace(/\+/g, " ") }); x = decodeURIComponent(x); x = encodeURI(x).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29"); x = x.replace(/\?.*$/, function (A) { return A.replace(/\+/g, "%2b") }); if (z) { z = z.trim ? z.trim() : z.replace(/^\s*/, "").replace(/\s*$/, ""); z = $.trim(z).replace(/"/g, "quot;").replace(/\(/g, "&#40;").replace(/\)/g, "&#41;").replace(/</g, "&lt;").replace(/>/g, "&gt;") } return z ? x + ' "' + z + '"' : x }) } f.doLinkOrImage = function (w, y, B) { w.trimWhitespace(); w.findTags(/\s*!?\[/, /\][ ]?(?:\n[ ]*)?(\[.*?\])?/); var x; if (w.endTag.length > 1 && w.startTag.length > 0) { w.startTag = w.startTag.replace(/!?\[/, ""); w.endTag = ""; this.addLinkDef(w, null) } else { w.selection = w.startTag + w.selection + w.endTag; w.startTag = w.endTag = ""; if (/\n\n/.test(w.selection)) { this.addLinkDef(w, null); return } var z = this; var A = function (E) { x.parentNode && x.parentNode.removeChild(x); if (E !== null) { w.selection = (" " + w.selection).replace(/([^\\](?:\\\\)*)(?=[[\]])/g, "$1\\").substr(1); var D = " [999]: " + n(E); var C = z.addLinkDef(w, D); w.startTag = B ? "![" : "["; w.endTag = "][" + C + "]"; if (!w.selection) { if (B) { w.selection = "enter image description here" } else { w.selection = "enter link description here" } } } y() }; x = l.createBackground(); if (B) { if (!this.hooks.insertImageDialog(A)) { l.prompt(p, c, A) } } else { l.prompt(v, d, A) } return true } }; f.doAutoindent = function (x, y) { var w = this; x.before = x.before.replace(/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]*\n$/, "\n\n"); x.before = x.before.replace(/(\n|^)[ ]{0,3}>[ \t]*\n$/, "\n\n"); x.before = x.before.replace(/(\n|^)[ \t]+\n$/, "\n\n"); if (/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]+.*\n$/.test(x.before)) { if (w.doList) { w.doList(x) } } if (/(\n|^)[ ]{0,3}>[ \t]+.*\n$/.test(x.before)) { if (w.doBlockquote) { w.doBlockquote(x) } } if (/(\n|^)(\t|[ ]{4,}).*\n$/.test(x.before)) { if (w.doCode) { w.doCode(x) } } }; f.doBlockquote = function (D, y) { D.selection = D.selection.replace(/^(\n*)([^\r]+?)(\n*)$/, function (J, I, H, G) { D.before += I; D.after = G + D.after; return H }); D.before = D.before.replace(/(>[ \t]*)$/, function (H, G) { D.selection = G + D.selection; return "" }); D.selection = D.selection.replace(/^(\s|>)+$/, ""); D.selection = D.selection || "Blockquote"; var C = "", B = "", E; if (D.before) { var F = D.before.replace(/\n$/, "").split("\n"); var A = false; for (var z = 0; z < F.length; z++) { var x = false; E = F[z]; A = A && E.length > 0; if (/^>/.test(E)) { x = true; if (!A && E.length > 1) { A = true } } else { if (/^[ \t]*$/.test(E)) { x = true } else { x = A } } if (x) { C += E + "\n" } else { B += C + E; C = "\n" } } if (!/(^|\n)>/.test(C)) { B += C; C = "" } } D.startTag = C; D.before = B; if (D.after) { D.after = D.after.replace(/^\n?/, "\n") } D.after = D.after.replace(/^(((\n|^)(\n[ \t]*)*>(.+\n)*.*)+(\n[ \t]*)*)/, function (G) { D.endTag = G; return "" }); var w = function (H) { var G = H ? "> " : ""; if (D.startTag) { D.startTag = D.startTag.replace(/\n((>|\s)*)\n$/, function (J, I) { return "\n" + I.replace(/^[ ]{0,3}>?[ \t]*$/gm, G) + "\n" }) } if (D.endTag) { D.endTag = D.endTag.replace(/^\n((>|\s)*)\n/, function (J, I) { return "\n" + I.replace(/^[ ]{0,3}>?[ \t]*$/gm, G) + "\n" }) } }; if (/^(?![ ]{0,3}>)/m.test(D.selection)) { this.wrap(D, o.lineLength - 2); D.selection = D.selection.replace(/^/gm, "> "); w(true); D.skipLines() } else { D.selection = D.selection.replace(/^[ ]{0,3}> ?/gm, ""); this.unwrap(D); w(false); if (!/^(\n|^)[ ]{0,3}>/.test(D.selection) && D.startTag) { D.startTag = D.startTag.replace(/\n{0,2}$/, "\n\n") } if (!/(\n|^)[ ]{0,3}>.*$/.test(D.selection) && D.endTag) { D.endTag = D.endTag.replace(/^\n{0,2}/, "\n\n") } } D.selection = this.hooks.postBlockquoteCreation(D.selection); if (!/\n/.test(D.selection)) { D.selection = D.selection.replace(/^(> *)/, function (G, H) { D.startTag += H; return "" }) } }; f.doCode = function (w, x) { var z = /\S[ ]*$/.test(w.before); var B = /^[ ]*\S/.test(w.after); if ((!B && !z) || /\n/.test(w.selection)) { w.before = w.before.replace(/[ ]{4}$/, function (C) { w.selection = C + w.selection; return "" }); var A = 1; var y = 1; if (/\n(\t|[ ]{4,}).*\n$/.test(w.before)) { A = 0 } if (/^\n(\t|[ ]{4,})/.test(w.after)) { y = 0 } w.skipLines(A, y); if (!w.selection) { w.startTag = "    "; w.selection = "enter code here" } else { if (/^[ ]{0,3}\S/m.test(w.selection)) { w.selection = w.selection.replace(/^/gm, "    ") } else { w.selection = w.selection.replace(/^[ ]{4}/gm, "") } } } else { w.trimWhitespace(); w.findTags(/`/, /`/); if (!w.startTag && !w.endTag) { w.startTag = w.endTag = "`"; if (!w.selection) { w.selection = "enter code here" } } else { if (w.endTag && !w.startTag) { w.before += w.endTag; w.endTag = "" } else { w.startTag = w.endTag = "" } } } }; f.doList = function (H, A, z) { var J = /(\n|^)(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*$/; var I = /^\n*(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*/; var w = "-"; var E = 1; var C = function () { var K; if (z) { K = " " + E + ". "; E++ } else { K = " " + w + " " } return K }; var D = function (K) { if (z === undefined) { z = /^\s*\d/.test(K) } K = K.replace(/^[ ]{0,3}([*+-]|\d+[.])\s/gm, function (L) { return C() }); return K }; H.findTags(/(\n|^)*[ ]{0,3}([*+-]|\d+[.])\s+/, null); if (H.before && !/\n$/.test(H.before) && !/^\n/.test(H.startTag)) { H.before += H.startTag; H.startTag = "" } if (H.startTag) { var y = /\d+[.]/.test(H.startTag); H.startTag = ""; H.selection = H.selection.replace(/\n[ ]{4}/g, "\n"); this.unwrap(H); H.skipLines(); if (y) { H.after = H.after.replace(I, D) } if (z == y) { return } } var B = 1; H.before = H.before.replace(J, function (K) { if (/^\s*([*+-])/.test(K)) { w = m.$1 } B = /[^\n]\n\n[^\n]/.test(K) ? 1 : 0; return D(K) }); if (!H.selection) { H.selection = "List item" } var F = C(); var x = 1; H.after = H.after.replace(I, function (K) { x = /[^\n]\n\n[^\n]/.test(K) ? 1 : 0; return D(K) }); H.trimWhitespace(true); H.skipLines(B, x, true); H.startTag = F; var G = F.replace(/./g, " "); this.wrap(H, o.lineLength - G.length); H.selection = H.selection.replace(/\n/g, "\n" + G) }; f.doHeading = function (y, z) { y.selection = y.selection.replace(/\s+/g, " "); y.selection = y.selection.replace(/(^\s+|\s+$)/g, ""); if (!y.selection) { y.startTag = "## "; y.selection = "Heading"; y.endTag = " ##"; return } var A = 0; y.findTags(/#+[ ]*/, /[ ]*#+/); if (/#+/.test(y.startTag)) { A = m.lastMatch.length } y.startTag = y.endTag = ""; y.findTags(null, /\s?(-+|=+)/); if (/=+/.test(y.endTag)) { A = 1 } if (/-+/.test(y.endTag)) { A = 2 } y.startTag = y.endTag = ""; y.skipLines(1, 1); var B = A == 0 ? 2 : A - 1; if (B > 0) { var x = B >= 2 ? "-" : "="; var w = y.selection.length; if (w > o.lineLength) { w = o.lineLength } y.endTag = "\n"; while (w--) { y.endTag += x } } }; f.doHorizontalRule = function (w, x) { w.startTag = "----------\n"; w.selection = ""; w.skipLines(2, 1, true) } })();

module.exports = Markdown;
});
require.register("rooms/template.js", function(module, exports, require){
var templates = {
    allocationEdit: '<h1>Edit allocations for accademic year beginning {{year}}</h1><hr /><div> {{#staircases}} <div class="allocationBlock"><h2>{{{name}}}</h2> {{#rooms}} <form data-old-allocation="{{allocation}}" data-roomid="{{id}}"> {{name}}: <input name="allocation" type="text" value="{{allocation}}" /></form> {{/rooms}} </div> {{/staircases}}</div>',
    choosingOrderEdit: '<div id="tabs"><ul><li><a href="#tabs-1">First Years</a></li><li><a href="#tabs-2">Second Years</a></li><li><a href="#tabs-3">Third Years</a></li></ul><div id="tabs-1"><ul id="sortable" class="sortable"><li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Joe Blogs <button> Delete</button></li><li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>John Smith </li></ul></div><div id="tabs-2"> Second Years </div><div id="tabs-3"> Third Years </div></div>',
    markdownEdit: '<form><div class="wmd-panel"><div id="wmd-button-bar"></div><textarea class="wmd-input" id="wmd-input" name="content">{{{Content}}}</textarea></div><div id="wmd-preview" class="wmd-panel wmd-preview"></div><input type="submit" value="Save" /></form><div id="getImage" class="dialog" title="Insert Image"><label> Select an image to upload</label><br /><input type="file" required /></div><div id="busy" class="dialog" title="Uploading"><div class="ajaxLoader"></div></div><div id="getURL" class="dialog" title="Insert Hyperlink"><form><label> http://example.com/ "optional title"</label><br /><input name="fileUpload" type="url" value="http://" /><br /></form></div>',
    NavigationList: '{{#Links}} <a href="{{url}}" {{#selected}}class="Selected"{{/selected}}>{{{name}}}</a>{{/Links}}',
    navigationTableEdit: '<h2> Add New</h2><form><label>ID</label><input name="id" type="text" /><label>Name</label><input name="name" type="text" required /><br /><label>Parent ID</label><input name="parentid" type="text" value="{{parentid}}" /><label>Type</label><select name="type"><option>staircase</option><option selected>room</option><option>page</option><option>special</option></select><br /><label>Weight</label><input name="weight" type="number" /><label>Bathroom Sharing</label><input name="bathroomsharing" type="number" value="{{bathroomsharing}}" /><br /><label>Rent Band</label><input name="rentband" type="number" value="{{rentband}}" /><label>Floor</label><input name="floor" type="number" value="{{floor}}" /><br /><input type="submit" value="Save" /></form><h2> Edit Existing</h2><table><tr><th> ID </th><th> Name </th><th> Parent ID </th><th> Type </th><th> Weight </th><th> Bathroom Sharing </th><th> Rent Band </th><th> Floor </th><th></th></tr> {{#Navigation}} <tr itemid="{{id}}"><td itemprop="id" data-type="text"><!--Required but could be ""--><div>{{id}}</div><input style="display: none; width:110px" type="text" value="{{id}}" /></td><td itemprop="name" data-type="text"><div>{{{name}}}</div><input style="display: none; width:115px" type="text" required value="{{name}}" /></td><td itemprop="parentid" data-type="text"><!--Required but could be ""--><div>{{parentid}}</div><input style="display: none; width:40px" type="text" value="{{parentid}}" /></td><td itemprop="type" data-type="text" style="width: 84px"><div>{{type}}</div><select style="display: none;" required ><option {{#isStaircase}}selected{{/isStaircase}}>staircase</option><option {{#isRoom}}selected{{/isRoom}}>room</option><option {{#isPage}}selected{{/isPage}}>page</option><option {{#isSpecial}}selected{{/isSpecial}}>special</option></select></td><td itemprop="weight" data-type="text"><div>{{weight}}</div><input style="display: none; width: 45px" type="number" value="{{weight}}" /></td><td itemprop="bathroomsharing" data-type="text"><div>{{bathroomsharing}}</div><input style="display: none; width:30px" type="number" value="{{bathroomsharing}}" /></td><td itemprop="rentband" data-type="text"><div>{{rentband}}</div><input style="display: none; width:30px" type="number" value="{{rentband}}" /></td><td itemprop="floor" data-type="text"><div>{{floor}}</div><input style="display: none; width:30px" type="number" value="{{floor}}" /></td><td><button>Delete</button></td></tr> {{/Navigation}}</table>',
    projector: '{{#staircases}}<div class="projectorBlock"><h1><a href="{{url}}">{{{name}}}</a></h1><ul> {{#rooms}} <li id="{{id}}" class="{{css}}"><a href="{{url}}">{{{name}}}<span class="allocationDisplayPart"> - <span class="allocationDisplay" data-roomid="{{id}}"></span></span></a></li> {{/rooms}} </ul></div>{{/staircases}}',
    room: '{{#rentband}}<table class="horizontalTable"><tr><th> Bathroom </th><td> {{bathroom}} </td></tr><tr><th> Rent Band </th><td> {{rentBandDescription}} </td></tr><tr><th> Floor </th><td> {{floorDescription}} </td></tr><tr><th> Current Allocation </th><td><span class="allocationDisplay" data-roomid="{{id}}" data-year="current"></span></td></tr><tr><th> Next Year\'s Allocation </th><td><span class="allocationDisplay" data-roomid="{{id}}" data-year="next"></span></td></tr></table>{{/rentband}}',
    staircase: '{{#Floors}}<h2> {{Name}}</h2><ul> {{#Rooms}} <li><a href="{{url}}">{{nameSingleLine}}{{#rentband}} - {{#bathroom}}{{bathroom}}, {{/bathroom}}{{rentBandDescription}}, <span class="allocationDisplay" data-roomid="{{id}}"></span>{{/rentband}}</a></li> {{/Rooms}}</ul>{{/Floors}}'
};

function template(templateName, view) {
    /// <summary>Apply the template to the view and return the resulting html.</summary>
    /// <param name="templateName" type="String">The name of the template to use</param>
    /// <param name="view" type="Object?">The object to apply to the template</param>
    /// <returns type="String" />
    if (arguments.length === 2) {
        return Mustache.to_html(templates[templateName], view);
    } else if (arguments.length === 1) {
        return function (view) {
            return Mustache.to_html(templates[templateName], view);
        }
    }
}
template.templates = templates;

module.exports = template;
});
require.alias("ForbesLindesay-curry/index.js", "rooms/deps/curry/index.js");

require.alias("ForbesLindesay-queue/index.js", "rooms/deps/queue/index.js");

require.alias("ForbesLindesay-base64-encode/index.js", "rooms/deps/base64-encode/index.js");
require.alias("ForbesLindesay-utf8-encode/index.js", "ForbesLindesay-base64-encode/deps/utf8-encode/index.js");

require.alias("component-find/index.js", "rooms/deps/find/index.js");
require.alias("component-to-function/index.js", "component-find/deps/to-function/index.js");
