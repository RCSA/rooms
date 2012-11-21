;(function(){
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
require.register("component-to-function/index.js", function(module, exports, require){

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
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
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18"
  return new Function('_', 'return _.' + str);
}
});
require.register("component-type/index.js", function(module, exports, require){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("ForbesLindesay-to-bool-function/index.js", function(module, exports, require){
var toFunction = require('to-function');
var type = require('type');

module.exports = toBoolFunction;

/**
 * Convert various possible things into a match function
 * 
 * @param  {Any} [selector]
 * @param  {Any} condition
 * @return {Function}
 */
function toBoolFunction(selector, condition) {
  if (arguments.length == 2) {
    selector = toFunction(selector);
    condition = toBoolFunction(condition);
    return function () {
      return condition(selector.apply(this, arguments));
    };
  } else {
    condition = selector;
  }
  var alternate = false;
  try {
    switch (type(condition)) {
      case 'regexp':
        alternate = regexpToFunction(condition);
        break;
      case 'string':
      case 'function':
        alternate = toFunction(condition);
        break;
      case 'object':
        alternate = objectToFunction(condition);
        break;
    }
  } catch (ex) {
    //ignore things that aren't valid functions
  }
  return function (val) {
    return (val === condition) ||
      (alternate && alternate.apply(this, arguments));
  }
}

/**
 * Convert `regexp` into a match funciton
 * 
 * @param  {Regexp} regexp
 * @return {Function}
 * @api private
 */
function regexpToFunction(regexp) {
  return function (val) {
    return regexp.test(val);
  };
}

/**
 * Convert `obj` into a match function.
 *
 * @param  {Object} obj
 * @return {Function}
 * @api private
 */
function objectToFunction(obj) {
  var fns = Object.keys(obj)
    .map(function (key) {
      return toBoolFunction(key, obj[key]);
    });
  return function(o){
    for (var i = 0; i < fns.length; i++) {
      if (!fns[i](o)) return false;
    }
    return true;
  }
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
require.register("ForbesLindesay-promises-a/index.js", function(module, exports, require){
;(function () {
  function promise() {
    var resolved = false,
        fulfilled = false,
        val,
        waiting = [],
        running = false,
        prom = {then: then, valueOf: valueOf, done: done}

    function next(skipTimeout) {
      if (waiting.length) {
        running = true
        waiting.shift()(skipTimeout || false)
      } else {
        running = false
      }
    }
    function then(cb, eb) {
      var def = promise()
      function done(skipTimeout) {
        var callback = fulfilled ? cb : eb
        if (typeof callback === 'function') {
          function timeoutDone() {
            var value;
            try {
              value = callback(val)
            } catch (ex) {
              def.reject(ex)
              return next()
            }
            def.fulfill(value);
            next(true);
          }
          if (skipTimeout) timeoutDone();
          else setTimeout(timeoutDone, 0)
        } else if (fulfilled) {
          def.fulfill(val)
          next(skipTimeout)
        } else {
          def.reject(val)
          next(skipTimeout)
        }
      }
      waiting.push(done);
      if (resolved && !running) {
        next()
      }
      return def.promise
    }
    function done(cb, eb) {
      var p = prom
      if (cb || eb) {
        p = p.then(cb, eb)
      }
      p.then(null, function (reason) {
        setTimeout(function () {
          throw reason
        }, 0)
      })
    }
    function resolve(success, value) {
      if (resolved) return;
      if (success && typeof value === 'object' && typeof value.then === 'function') {
        value.then(fulfill, reject)
        return
      }
      resolved = true
      fulfilled = success
      val = value
      next()
    }
    function fulfill(val) {
      resolve(true, val)
    }
    function reject(err) {
      resolve(false, err)
    }

    function valueOf() {
      return fulfilled ? val : prom;
    }

    return {
      promise: prom,
      fulfill: fulfill,
      reject: reject
    }
  }
  
  if (typeof module != 'undefined' && typeof module.exports != 'undefined')
    module.exports = promise
  else
    window.promise = promise
}())
});
require.register("ForbesLindesay-imgur/index.js", function(module, exports, require){
var promise = require('promises-a');
var emitter = require('emitter');

// Get your own key: http://api.imgur.com/
module.exports = imgur;
function imgur(apiKey) {
  function upload(file) {
    var def = promise();
    emitter(def.promise);
    try {
      if (!file) {
        var err = new Error('You must supply an image to upload.');
        err.code = 'MissingFile';
        throw err;
      }
      if (!file.type.match(/image.*/)) {
        var err = new Error('Invalid file type, imgur only accepts images.');
        err.code = 'InvalidFileType';
        throw err;
      }

      var fd = new FormData();
      fd.append("image", file); // Append the file
      fd.append("key", apiKey);
      
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "http://api.imgur.com/2/upload.json"); // Boooom!
      xhr.onload = function () {
        try {
          def.fulfill(JSON.parse(xhr.responseText).upload);
        } catch (ex) {
          def.reject(ex);
        }
      }
      xhr.onerror = def.reject;
      xhr.upload.onprogress = function (e) {
        e.perecent = e.loaded / e.total * 100;
        def.promise.emit('progress', e);
      }
      def.promise.abort = function () {
        xhr.abort();
        var err = new Error('Image upload aborted');
        err.code = 'UploadAborted';
        def.reject(err);
      };

      xhr.send(fd);
    } catch (ex) {
      def.reject(ex);
    }
    return def.promise;
  }
  return {upload: upload};
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
require.register("component-group-by/index.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Group `arr` with callback `fn(val, i)`.
 *
 * @param {Array} arr
 * @param {Function|String} fn or prop
 * @return {Array}
 * @api public
 */

module.exports = function(arr, fn){
  var ret = {};
  var prop;
  fn = toFunction(fn);

  for (var i = 0; i < arr.length; ++i) {
    prop = fn(arr[i], i);
    ret[prop] = ret[prop] || [];
    ret[prop].push(arr[i]);
  }

  return ret;
};
});
require.register("component-emitter/index.js", function(module, exports, require){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 * 
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
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
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
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
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
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
  this._callbacks = this._callbacks || {};
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
  this._callbacks = this._callbacks || {};
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
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


});
require.register("rooms/index.js", function(module, exports, require){
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
var Path = require('./libraries/path');
var server = require('./server');
var stream = require('./stream');
var condition = require('to-bool-function');

var $ = jQuery;
exports.SelectedStaircaseID = '';
exports.SelectedRoomID = '';
exports.Navigation = [];
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
    var Staircases = nav.filter(condition('parentid', 'Root'));
    $("#staircases").html(template("NavigationList", { Links: Staircases }));

    //Load Rooms
    var Rooms = nav.filter(condition('parentid', exports.SelectedStaircaseID));
    $("#rooms").html(template("NavigationList", { Links: Rooms }));
}

function mapPaths() {
    //path, itemID, parentIDs, edit
    function map(path, spec) {
        var exit = spec.exit || function () { };
        Path.map(path).to(function () {
            var item = find(exports.Navigation, condition('id', this.params[spec.id] || spec.id))
             || spec.item;
            var parentid = this.params[spec.parentIDs] || spec.parentIDs;
            if (!parentid || (item.parentid === parentid) || 
                (spec.parentIDs.some && spec.parentIDs.some(function (id) { return id == item.parentid; }))) {
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

Path.root("#/");
mapPaths();

//Load all the navigation data up front then start the applicaion.
server.navigation.read(function (data) {
    exports.Navigation = data.map(model.navigationItem).sort(navigationItemOrder);
    $(function () {
        $("body").removeClass("loading").addClass("background");
        $("#page").fadeIn();
        Path.listen();
        $("#isThisYears").click(exports.refreshAllocationsDisplay);
    });
});
});
require.register("rooms/model.js", function(module, exports, require){
﻿var app = require('./');

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
});
require.register("rooms/views/static-page.js", function(module, exports, require){
﻿var loadMarkdown = require('../markdown/load-markdown');

module.exports = staticPage;
function staticPage(item) {
    loadMarkdown(item, true);
    document.getElementById('templated').innerHTML = '';
}
});
require.register("rooms/views/staircase.js", function(module, exports, require){
var app = require('../');
var loadMarkdown = require('../markdown/load-markdown');
var template = require('../template');
var groupBy = require('group-by');
var condition = require('to-bool-function');

module.exports = function (staircase) {
    loadMarkdown(staircase);

    var rooms = app.Navigation
      .filter(condition('parentid', staircase.id))
      .filter(condition('type', 'room'));

    var floors = toFloorsArray(groupBy(rooms, 'floor'));

    document.getElementById('templated').innerHTML = template('staircase', { Floors: floors });

    app.refreshAllocationsDisplay();
}

function toFloorsArray(floors) {
  return Object.keys(floors)
    .map(function (floor) {
      return {
        Name: floors[floor][0].floorDescription(),
        Rooms: floors[floor]
      }
    });
}
});
require.register("rooms/views/room.js", function(module, exports, require){
var app = require('../');
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
﻿var app = require('../');
var find = require('find');
var loginURI = require('../helpers/status-display').uri;
var template = require('../template');
var navigationItemOrder = require('../helpers/navigation-item-order');
var refresh = require('../libraries/path').refresh;
var groupBy = require('group-by');
var stream = require('../stream');
var condition = require('to-bool-function');

var homeHTML;
function selectStaircaseGroups(staircaseGroups) {
    return Object.keys(staircaseGroups)
        .map(function (staircaseID) {
            var staircase = Object.create(find(app.Navigation, condition('id', staircaseID)));
            staircase.rooms = staircaseGroups[staircaseID]
                .filter(function (room) {
                    return room.rentband !== 0;
                });
            return staircase;
        });
}
var isInProjectorMode = false;
$("#isThisYears").click(function () {
    if (isInProjectorMode) {
        exports.exit();
        refresh();
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
        var mappedStaircases = selectStaircaseGroups(groupBy(app.Navigation.filter(condition('type', 'room')), 'parentid'))
            .sort(navigationItemOrder);
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
﻿var app = require('../');
var model = require('../model');
var loadMarkdown = require('../markdown/load-markdown');
var toTable = require('../helpers/table');
var setStatus = require('../helpers/status-display').setStatus;
var template = require('../template');
var navigationItemOrder = require('../helpers/navigation-item-order');
var server = require('../server');
var condition = require('to-bool-function');

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
    if (idChange && app.Navigation.some(condition('id', spec.id))) {
        return validationError("There is already an item with this ID");
    } else if (spec.id === spec.parentid) {
        return validationError("An item can't be its own parent");
    } else if (spec.parentid !== "Root" && !app.Navigation.some(condition('id', spec.parentid))) {
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
    var children = app.Navigation.filter(condition('parentid', oldID));
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
        server.navigation.create(spec, function () {
            setStatus("Saved", 2000);
        });
        view.navigationTableEdit(model.navigationItem(spec));
    }
    return false;
}
function update(id, name, value) {
    var item = app.Navigation.filter(condition('id', id))[0];
    var spec = Object.create(item);
    spec[name] = value;

    if (validateSpec(spec, name === "id")) {
        item[name] = value;
        if (name === "id") {
            //The server must also separely ensure the cascade works, including markdown, allocation etc.
            cascadeIDChange(id, value);
        }
        setStatus("Saving...");
        server.navigation.update(id, name, value, function () {
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
    toTable('#templated', update);
    $("#templated button").click(function (e) {
        if (confirm("Are you sure you want to delete?")) {
            var id = $(e.target).parents("tr").attr("itemid");
            var index = app.Navigation.indexOf(app.Navigation.filter(condition('id', id))[0]);
            app.Navigation.splice(index, 1);
            view.navigationTableEdit();
            setStatus("Deleting...");
            server.navigation.del(id, function () {
                setStatus("Deleted", 2000);
            });
        }
    });
    app.reloadNavigation("", "navigationTableEdit");
};
});
require.register("rooms/views/allocation-edit.js", function(module, exports, require){
﻿var app = require('../');
var setStatus = require('../helpers/status-display').setStatus;
var curry = require('curry');
var find = require('find');
var template = require('../template');
var navigationItemOrder = require('../helpers/navigation-item-order');
var loadMarkdown = require('../markdown/load-markdown');
var refresh = require('../libraries/path').refresh;
var groupBy = require('group-by');
var server = require('../server');
var stream = require('../stream');
var condition = require('to-bool-function');

var selectRoomAllocation = curry(function (allocations, room) {
    var allocation = allocations[room.id];
    return {
        id: room.id,
        name: room.nameSingleLine(),
        allocation: allocation || ""
    };
});
function selectStaircaseGroups(allocations, staircaseGroups) {
    return Object.keys(staircaseGroups)
        .map(function (staircaseID) {
            var staircase = Object.create(find(app.Navigation, condition('id', staircaseID)));
            staircase.rooms = staircaseGroups[staircaseID].map(selectRoomAllocation(allocations));
            return staircase;
        });
}

var isInAllocationEdit = false;
$("#isThisYears").click(function () {
    if (isInAllocationEdit) {
        refresh();
    }
});

exports.enter = function (item) {
    isInAllocationEdit = true;
    loadMarkdown(item, true);
    $("#templated").html();
    stream.getAllocations(function (allocationsData) {
        var allocations = allocationsData.defaultAllocations();
        var year = allocations.year;
        var mappedStaircases = selectStaircaseGroups(allocations, groupBy(app.Navigation
            .filter(condition('type', "room"))
            .filter(function (room) { return room.rentband !== 0; }),
            'parentid'))
            .sort(navigationItemOrder);
        $("#templated")
            .html(template("allocationEdit", { staircases: mappedStaircases, year: year }))
            .find("form").submit(function (e) {
                var value = e.currentTarget.allocation.value;
                var form = $(e.currentTarget);
                form.find("input").removeClass("validationError");
                if (form.attr("data-old-allocation") !== value) {
                    form.attr("data-old-allocation", value);
                    setStatus("Updating Allocation");
                    server.allocation.update(form.attr("data-roomid"), year, value, function (result) {
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
};
exports.exit = function () {
    isInAllocationEdit = false;
};
});
require.register("rooms/markdown/load-markdown.js", function(module, exports, require){
var app = require('../');
var converter = require('./converter');
var server = require('../server');

module.exports = function (item) {
    /// <summary>Loads markdown and displays it in the markdown element on the page.</summary>
    /// <param name="ID" type="String">The ID of the entity to get markdown for.</param>
    server.markdown.read(item, function (md) {
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
var app = require('../');
var converter = require('./converter');
var setStatus = require('../helpers/status-display').setStatus;
var Markdown = require('../libraries/pagedown.js');
var template = require('../template');
var server = require('../server');

var imgur = require('imgur');
var imgurAPIKey = "e0b484465d77858ebaf6b3c7c1732909";
var upload = imgur(imgurAPIKey).upload;

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
                dialogs.showBusy();
                upload(data.find("input")[0].files[0])
                    .done(function (result) {
                        dialogs.hideBusy();
                        callback(result.links.original);
                    }, function (reason) {
                        dialogs.hideBusy();
                        callback(null);
                        if (reason.code === 'InvalidFileType') {
                            alert('The file you provided was not a valid image.');
                        } else  if (reason.code === 'MissingFile') {
                            alert('You didn\'t provide an image to upload');
                        } else {
                            throw reason;
                        }
                    });
            }
        });
        return true; // tell the editor that we'll take care of getting the image url
    });
    editor.run();
}

module.exports = function (item) {
    /// <summary>Loads markdown and displays it in an edit control on ghe page, still in the markdown section.</summary>
    /// <param name="ID" type="String">The ID of the entity to edit markdown for.</param>
    server.markdown.read(item, function (md) {
        $("#markdown").html(template("markdownEdit", { Content: md }))
            .find("form").submit(function (e) {
            var form = e.target;
            var content = form.content.value;
            if (content !== md) {
                setStatus("Saving description");
                server.markdown.update(item.id, content, function () {
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
var Markdown = require('../libraries/pagedown.js');

var converter = module.exports = Markdown.getSanitizingConverter();
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
});
require.register("rooms/helpers/table.js", function(module, exports, require){
﻿var $ = jQuery;
module.exports = makeTable;
function makeTable(selector, callback) {
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
var stream = require('../stream');
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
var Markdown;

if (typeof exports === "object" && typeof require === "function") // we're in a CommonJS (e.g. Node.js) module
    Markdown = exports;
else
    Markdown = {};

//
// Usage:
//
//   var text = "Markdown *rocks*.";
//
//   var converter = new Markdown.Converter();
//   var html = converter.makeHtml(text);
//
//   alert(html);
//
// Note: move the sample code to the bottom of this
// file before uncommenting it.
//

(function () {

    function identity(x) { return x; }
    function returnFalse() { return false; }

    function HookCollection() { }

    HookCollection.prototype = {

        chain: function (hookname, func) {
            var original = this[hookname];
            if (!original)
                throw new Error("unknown hook " + hookname);

            if (original === identity)
                this[hookname] = func;
            else
                this[hookname] = function (x) { return func(original(x)); }
        },
        set: function (hookname, func) {
            if (!this[hookname])
                throw new Error("unknown hook " + hookname);
            this[hookname] = func;
        },
        addNoop: function (hookname) {
            this[hookname] = identity;
        },
        addFalse: function (hookname) {
            this[hookname] = returnFalse;
        }
    };

    Markdown.HookCollection = HookCollection;

    // g_urls and g_titles allow arbitrary user-entered strings as keys. This
    // caused an exception (and hence stopped the rendering) when the user entered
    // e.g. [push] or [__proto__]. Adding a prefix to the actual key prevents this
    // (since no builtin property starts with "s_"). See
    // http://meta.stackoverflow.com/questions/64655/strange-wmd-bug
    // (granted, switching from Array() to Object() alone would have left only __proto__
    // to be a problem)
    function SaveHash() { }
    SaveHash.prototype = {
        set: function (key, value) {
            this["s_" + key] = value;
        },
        get: function (key) {
            return this["s_" + key];
        }
    };

    Markdown.Converter = function () {
        var pluginHooks = this.hooks = new HookCollection();
        pluginHooks.addNoop("plainLinkText");  // given a URL that was encountered by itself (without markup), should return the link text that's to be given to this link
        pluginHooks.addNoop("preConversion");  // called with the orignal text as given to makeHtml. The result of this plugin hook is the actual markdown source that will be cooked
        pluginHooks.addNoop("postConversion"); // called with the final cooked HTML code. The result of this plugin hook is the actual output of makeHtml

        //
        // Private state of the converter instance:
        //

        // Global hashes, used by various utility routines
        var g_urls;
        var g_titles;
        var g_html_blocks;

        // Used to track when we're inside an ordered or unordered list
        // (see _ProcessListItems() for details):
        var g_list_level;

        this.makeHtml = function (text) {

            //
            // Main function. The order in which other subs are called here is
            // essential. Link and image substitutions need to happen before
            // _EscapeSpecialCharsWithinTagAttributes(), so that any *'s or _'s in the <a>
            // and <img> tags get encoded.
            //

            // This will only happen if makeHtml on the same converter instance is called from a plugin hook.
            // Don't do that.
            if (g_urls)
                throw new Error("Recursive call to converter.makeHtml");
        
            // Create the private state objects.
            g_urls = new SaveHash();
            g_titles = new SaveHash();
            g_html_blocks = [];
            g_list_level = 0;

            text = pluginHooks.preConversion(text);

            // attacklab: Replace ~ with ~T
            // This lets us use tilde as an escape char to avoid md5 hashes
            // The choice of character is arbitray; anything that isn't
            // magic in Markdown will work.
            text = text.replace(/~/g, "~T");

            // attacklab: Replace $ with ~D
            // RegExp interprets $ as a special character
            // when it's in a replacement string
            text = text.replace(/\$/g, "~D");

            // Standardize line endings
            text = text.replace(/\r\n/g, "\n"); // DOS to Unix
            text = text.replace(/\r/g, "\n"); // Mac to Unix

            // Make sure text begins and ends with a couple of newlines:
            text = "\n\n" + text + "\n\n";

            // Convert all tabs to spaces.
            text = _Detab(text);

            // Strip any lines consisting only of spaces and tabs.
            // This makes subsequent regexen easier to write, because we can
            // match consecutive blank lines with /\n+/ instead of something
            // contorted like /[ \t]*\n+/ .
            text = text.replace(/^[ \t]+$/mg, "");

            // Turn block-level HTML blocks into hash entries
            text = _HashHTMLBlocks(text);

            // Strip link definitions, store in hashes.
            text = _StripLinkDefinitions(text);

            text = _RunBlockGamut(text);

            text = _UnescapeSpecialChars(text);

            // attacklab: Restore dollar signs
            text = text.replace(/~D/g, "$$");

            // attacklab: Restore tildes
            text = text.replace(/~T/g, "~");

            text = pluginHooks.postConversion(text);

            g_html_blocks = g_titles = g_urls = null;

            return text;
        };

        function _StripLinkDefinitions(text) {
            //
            // Strips link definitions from text, stores the URLs and titles in
            // hash references.
            //

            // Link defs are in the form: ^[id]: url "optional title"

            /*
            text = text.replace(/
                ^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
                [ \t]*
                \n?                 // maybe *one* newline
                [ \t]*
                <?(\S+?)>?          // url = $2
                (?=\s|$)            // lookahead for whitespace instead of the lookbehind removed below
                [ \t]*
                \n?                 // maybe one newline
                [ \t]*
                (                   // (potential) title = $3
                    (\n*)           // any lines skipped = $4 attacklab: lookbehind removed
                    [ \t]+
                    ["(]
                    (.+?)           // title = $5
                    [")]
                    [ \t]*
                )?                  // title is optional
                (?:\n+|$)
            /gm, function(){...});
            */

            text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
                function (wholeMatch, m1, m2, m3, m4, m5) {
                    m1 = m1.toLowerCase();
                    g_urls.set(m1, _EncodeAmpsAndAngles(m2));  // Link IDs are case-insensitive
                    if (m4) {
                        // Oops, found blank lines, so it's not a title.
                        // Put back the parenthetical statement we stole.
                        return m3;
                    } else if (m5) {
                        g_titles.set(m1, m5.replace(/"/g, "&quot;"));
                    }

                    // Completely remove the definition from the text
                    return "";
                }
            );

            return text;
        }

        function _HashHTMLBlocks(text) {

            // Hashify HTML blocks:
            // We only want to do this for block-level HTML tags, such as headers,
            // lists, and tables. That's because we still want to wrap <p>s around
            // "paragraphs" that are wrapped in non-block-level tags, such as anchors,
            // phrase emphasis, and spans. The list of tags we're looking for is
            // hard-coded:
            
            //var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"
            //var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"

            // First, look for nested blocks, e.g.:
            //   <div>
            //     <div>
            //     tags for inner block must be indented.
            //     </div>
            //   </div>
            //
            // The outermost tags must start at the left margin for this to match, and
            // the inner nested divs must be indented.
            // We need to do this before the next, more liberal match, because the next
            // match will start at the first `<div>` and stop at the first `</div>`.

            // attacklab: This regex can be expensive when it fails.

            /*
            text = text.replace(/
                (                       // save in $1
                    ^                   // start of line  (with /m)
                    <($block_tags_a)    // start tag = $2
                    \b                  // word break
                                        // attacklab: hack around khtml/pcre bug...
                    [^\r]*?\n           // any number of lines, minimally matching
                    </\2>               // the matching end tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by a newline
                )                       // attacklab: there are sentinel newlines at end of document
            /gm,function(){...}};
            */
            text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, hashElement);

            //
            // Now match more liberally, simply from `\n<tag>` to `</tag>\n`
            //

            /*
            text = text.replace(/
                (                       // save in $1
                    ^                   // start of line  (with /m)
                    <($block_tags_b)    // start tag = $2
                    \b                  // word break
                                        // attacklab: hack around khtml/pcre bug...
                    [^\r]*?             // any number of lines, minimally matching
                    .*</\2>             // the matching end tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by a newline
                )                       // attacklab: there are sentinel newlines at end of document
            /gm,function(){...}};
            */
            text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, hashElement);

            // Special case just for <hr />. It was easier to make a special case than
            // to make the other regex more complicated.  

            /*
            text = text.replace(/
                \n                  // Starting after a blank line
                [ ]{0,3}
                (                   // save in $1
                    (<(hr)          // start tag = $2
                        \b          // word break
                        ([^<>])*?
                    \/?>)           // the matching end tag
                    [ \t]*
                    (?=\n{2,})      // followed by a blank line
                )
            /g,hashElement);
            */
            text = text.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, hashElement);

            // Special case for standalone HTML comments:

            /*
            text = text.replace(/
                \n\n                                            // Starting after a blank line
                [ ]{0,3}                                        // attacklab: g_tab_width - 1
                (                                               // save in $1
                    <!
                    (--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)   // see http://www.w3.org/TR/html-markup/syntax.html#comments and http://meta.stackoverflow.com/q/95256
                    >
                    [ \t]*
                    (?=\n{2,})                                  // followed by a blank line
                )
            /g,hashElement);
            */
            text = text.replace(/\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g, hashElement);

            // PHP and ASP-style processor instructions (<?...?> and <%...%>)

            /*
            text = text.replace(/
                (?:
                    \n\n            // Starting after a blank line
                )
                (                   // save in $1
                    [ ]{0,3}        // attacklab: g_tab_width - 1
                    (?:
                        <([?%])     // $2
                        [^\r]*?
                        \2>
                    )
                    [ \t]*
                    (?=\n{2,})      // followed by a blank line
                )
            /g,hashElement);
            */
            text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, hashElement);

            return text;
        }

        function hashElement(wholeMatch, m1) {
            var blockText = m1;

            // Undo double lines
            blockText = blockText.replace(/^\n+/, "");

            // strip trailing blank lines
            blockText = blockText.replace(/\n+$/g, "");

            // Replace the element text with a marker ("~KxK" where x is its key)
            blockText = "\n\n~K" + (g_html_blocks.push(blockText) - 1) + "K\n\n";

            return blockText;
        }

        function _RunBlockGamut(text, doNotUnhash) {
            //
            // These are all the transformations that form block-level
            // tags like paragraphs, headers, and list items.
            //
            text = _DoHeaders(text);

            // Do Horizontal Rules:
            var replacement = "<hr />\n";
            text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, replacement);
            text = text.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, replacement);
            text = text.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, replacement);

            text = _DoLists(text);
            text = _DoCodeBlocks(text);
            text = _DoBlockQuotes(text);

            // We already ran _HashHTMLBlocks() before, in Markdown(), but that
            // was to escape raw HTML in the original Markdown source. This time,
            // we're escaping the markup we've just created, so that we don't wrap
            // <p> tags around block-level tags.
            text = _HashHTMLBlocks(text);
            text = _FormParagraphs(text, doNotUnhash);

            return text;
        }

        function _RunSpanGamut(text) {
            //
            // These are all the transformations that occur *within* block-level
            // tags like paragraphs, headers, and list items.
            //

            text = _DoCodeSpans(text);
            text = _EscapeSpecialCharsWithinTagAttributes(text);
            text = _EncodeBackslashEscapes(text);

            // Process anchor and image tags. Images must come first,
            // because ![foo][f] looks like an anchor.
            text = _DoImages(text);
            text = _DoAnchors(text);

            // Make links out of things like `<http://example.com/>`
            // Must come after _DoAnchors(), because you can use < and >
            // delimiters in inline links like [this](<url>).
            text = _DoAutoLinks(text);
            
            text = text.replace(/~P/g, "://"); // put in place to prevent autolinking; reset now
            
            text = _EncodeAmpsAndAngles(text);
            text = _DoItalicsAndBold(text);

            // Do hard breaks:
            text = text.replace(/  +\n/g, " <br>\n");

            return text;
        }

        function _EscapeSpecialCharsWithinTagAttributes(text) {
            //
            // Within tags -- meaning between < and > -- encode [\ ` * _] so they
            // don't conflict with their use in Markdown for code, italics and strong.
            //

            // Build a regex to find HTML tags and comments.  See Friedl's 
            // "Mastering Regular Expressions", 2nd Ed., pp. 200-201.

            // SE: changed the comment part of the regex

            var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>)/gi;

            text = text.replace(regex, function (wholeMatch) {
                var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g, "$1`");
                tag = escapeCharacters(tag, wholeMatch.charAt(1) == "!" ? "\\`*_/" : "\\`*_"); // also escape slashes in comments to prevent autolinking there -- http://meta.stackoverflow.com/questions/95987
                return tag;
            });

            return text;
        }

        function _DoAnchors(text) {
            //
            // Turn Markdown link shortcuts into XHTML <a> tags.
            //
            //
            // First, handle reference-style links: [link text] [id]
            //

            /*
            text = text.replace(/
                (                           // wrap whole match in $1
                    \[
                    (
                        (?:
                            \[[^\]]*\]      // allow brackets nested one level
                            |
                            [^\[]           // or anything else
                        )*
                    )
                    \]

                    [ ]?                    // one optional space
                    (?:\n[ ]*)?             // one optional newline followed by spaces

                    \[
                    (.*?)                   // id = $3
                    \]
                )
                ()()()()                    // pad remaining backreferences
            /g, writeAnchorTag);
            */
            text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeAnchorTag);

            //
            // Next, inline-style links: [link text](url "optional title")
            //

            /*
            text = text.replace(/
                (                           // wrap whole match in $1
                    \[
                    (
                        (?:
                            \[[^\]]*\]      // allow brackets nested one level
                            |
                            [^\[\]]         // or anything else
                        )*
                    )
                    \]
                    \(                      // literal paren
                    [ \t]*
                    ()                      // no id, so leave $3 empty
                    <?(                     // href = $4
                        (?:
                            \([^)]*\)       // allow one level of (correctly nested) parens (think MSDN)
                            |
                            [^()\s]
                        )*?
                    )>?                
                    [ \t]*
                    (                       // $5
                        (['"])              // quote char = $6
                        (.*?)               // Title = $7
                        \6                  // matching quote
                        [ \t]*              // ignore any spaces/tabs between closing quote and )
                    )?                      // title is optional
                    \)
                )
            /g, writeAnchorTag);
            */

            text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?((?:\([^)]*\)|[^()\s])*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeAnchorTag);

            //
            // Last, handle reference-style shortcuts: [link text]
            // These must come last in case you've also got [link test][1]
            // or [link test](/foo)
            //

            /*
            text = text.replace(/
                (                   // wrap whole match in $1
                    \[
                    ([^\[\]]+)      // link text = $2; can't contain '[' or ']'
                    \]
                )
                ()()()()()          // pad rest of backreferences
            /g, writeAnchorTag);
            */
            text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

            return text;
        }

        function writeAnchorTag(wholeMatch, m1, m2, m3, m4, m5, m6, m7) {
            if (m7 == undefined) m7 = "";
            var whole_match = m1;
            var link_text = m2.replace(/:\/\//g, "~P"); // to prevent auto-linking withing the link. will be converted back after the auto-linker runs
            var link_id = m3.toLowerCase();
            var url = m4;
            var title = m7;

            if (url == "") {
                if (link_id == "") {
                    // lower-case and turn embedded newlines into spaces
                    link_id = link_text.toLowerCase().replace(/ ?\n/g, " ");
                }
                url = "#" + link_id;

                if (g_urls.get(link_id) != undefined) {
                    url = g_urls.get(link_id);
                    if (g_titles.get(link_id) != undefined) {
                        title = g_titles.get(link_id);
                    }
                }
                else {
                    if (whole_match.search(/\(\s*\)$/m) > -1) {
                        // Special case for explicit empty url
                        url = "";
                    } else {
                        return whole_match;
                    }
                }
            }
            url = encodeProblemUrlChars(url);
            url = escapeCharacters(url, "*_");
            var result = "<a href=\"" + url + "\"";

            if (title != "") {
                title = attributeEncode(title);
                title = escapeCharacters(title, "*_");
                result += " title=\"" + title + "\"";
            }

            result += ">" + link_text + "</a>";

            return result;
        }

        function _DoImages(text) {
            //
            // Turn Markdown image shortcuts into <img> tags.
            //

            //
            // First, handle reference-style labeled images: ![alt text][id]
            //

            /*
            text = text.replace(/
                (                   // wrap whole match in $1
                    !\[
                    (.*?)           // alt text = $2
                    \]

                    [ ]?            // one optional space
                    (?:\n[ ]*)?     // one optional newline followed by spaces

                    \[
                    (.*?)           // id = $3
                    \]
                )
                ()()()()            // pad rest of backreferences
            /g, writeImageTag);
            */
            text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeImageTag);

            //
            // Next, handle inline images:  ![alt text](url "optional title")
            // Don't forget: encode * and _

            /*
            text = text.replace(/
                (                   // wrap whole match in $1
                    !\[
                    (.*?)           // alt text = $2
                    \]
                    \s?             // One optional whitespace character
                    \(              // literal paren
                    [ \t]*
                    ()              // no id, so leave $3 empty
                    <?(\S+?)>?      // src url = $4
                    [ \t]*
                    (               // $5
                        (['"])      // quote char = $6
                        (.*?)       // title = $7
                        \6          // matching quote
                        [ \t]*
                    )?              // title is optional
                    \)
                )
            /g, writeImageTag);
            */
            text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeImageTag);

            return text;
        }
        
        function attributeEncode(text) {
            // unconditionally replace angle brackets here -- what ends up in an attribute (e.g. alt or title)
            // never makes sense to have verbatim HTML in it (and the sanitizer would totally break it)
            return text.replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        }

        function writeImageTag(wholeMatch, m1, m2, m3, m4, m5, m6, m7) {
            var whole_match = m1;
            var alt_text = m2;
            var link_id = m3.toLowerCase();
            var url = m4;
            var title = m7;

            if (!title) title = "";

            if (url == "") {
                if (link_id == "") {
                    // lower-case and turn embedded newlines into spaces
                    link_id = alt_text.toLowerCase().replace(/ ?\n/g, " ");
                }
                url = "#" + link_id;

                if (g_urls.get(link_id) != undefined) {
                    url = g_urls.get(link_id);
                    if (g_titles.get(link_id) != undefined) {
                        title = g_titles.get(link_id);
                    }
                }
                else {
                    return whole_match;
                }
            }
            
            alt_text = escapeCharacters(attributeEncode(alt_text), "*_[]()");
            url = escapeCharacters(url, "*_");
            var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";

            // attacklab: Markdown.pl adds empty title attributes to images.
            // Replicate this bug.

            //if (title != "") {
            title = attributeEncode(title);
            title = escapeCharacters(title, "*_");
            result += " title=\"" + title + "\"";
            //}

            result += " />";

            return result;
        }

        function _DoHeaders(text) {

            // Setext-style headers:
            //  Header 1
            //  ========
            //  
            //  Header 2
            //  --------
            //
            text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
                function (wholeMatch, m1) { return "<h1>" + _RunSpanGamut(m1) + "</h1>\n\n"; }
            );

            text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
                function (matchFound, m1) { return "<h2>" + _RunSpanGamut(m1) + "</h2>\n\n"; }
            );

            // atx-style headers:
            //  # Header 1
            //  ## Header 2
            //  ## Header 2 with closing hashes ##
            //  ...
            //  ###### Header 6
            //

            /*
            text = text.replace(/
                ^(\#{1,6})      // $1 = string of #'s
                [ \t]*
                (.+?)           // $2 = Header text
                [ \t]*
                \#*             // optional closing #'s (not counted)
                \n+
            /gm, function() {...});
            */

            text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
                function (wholeMatch, m1, m2) {
                    var h_level = m1.length;
                    return "<h" + h_level + ">" + _RunSpanGamut(m2) + "</h" + h_level + ">\n\n";
                }
            );

            return text;
        }

        function _DoLists(text) {
            //
            // Form HTML ordered (numbered) and unordered (bulleted) lists.
            //

            // attacklab: add sentinel to hack around khtml/safari bug:
            // http://bugs.webkit.org/show_bug.cgi?id=11231
            text += "~0";

            // Re-usable pattern to match any entirel ul or ol list:

            /*
            var whole_list = /
                (                                   // $1 = whole list
                    (                               // $2
                        [ ]{0,3}                    // attacklab: g_tab_width - 1
                        ([*+-]|\d+[.])              // $3 = first list item marker
                        [ \t]+
                    )
                    [^\r]+?
                    (                               // $4
                        ~0                          // sentinel for workaround; should be $
                        |
                        \n{2,}
                        (?=\S)
                        (?!                         // Negative lookahead for another list item marker
                            [ \t]*
                            (?:[*+-]|\d+[.])[ \t]+
                        )
                    )
                )
            /g
            */
            var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

            if (g_list_level) {
                text = text.replace(whole_list, function (wholeMatch, m1, m2) {
                    var list = m1;
                    var list_type = (m2.search(/[*+-]/g) > -1) ? "ul" : "ol";

                    var result = _ProcessListItems(list, list_type);

                    // Trim any trailing whitespace, to put the closing `</$list_type>`
                    // up on the preceding line, to get it past the current stupid
                    // HTML block parser. This is a hack to work around the terrible
                    // hack that is the HTML block parser.
                    result = result.replace(/\s+$/, "");
                    result = "<" + list_type + ">" + result + "</" + list_type + ">\n";
                    return result;
                });
            } else {
                whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
                text = text.replace(whole_list, function (wholeMatch, m1, m2, m3) {
                    var runup = m1;
                    var list = m2;

                    var list_type = (m3.search(/[*+-]/g) > -1) ? "ul" : "ol";
                    var result = _ProcessListItems(list, list_type);
                    result = runup + "<" + list_type + ">\n" + result + "</" + list_type + ">\n";
                    return result;
                });
            }

            // attacklab: strip sentinel
            text = text.replace(/~0/, "");

            return text;
        }

        var _listItemMarkers = { ol: "\\d+[.]", ul: "[*+-]" };

        function _ProcessListItems(list_str, list_type) {
            //
            //  Process the contents of a single ordered or unordered list, splitting it
            //  into individual list items.
            //
            //  list_type is either "ul" or "ol".

            // The $g_list_level global keeps track of when we're inside a list.
            // Each time we enter a list, we increment it; when we leave a list,
            // we decrement. If it's zero, we're not in a list anymore.
            //
            // We do this because when we're not inside a list, we want to treat
            // something like this:
            //
            //    I recommend upgrading to version
            //    8. Oops, now this line is treated
            //    as a sub-list.
            //
            // As a single paragraph, despite the fact that the second line starts
            // with a digit-period-space sequence.
            //
            // Whereas when we're inside a list (or sub-list), that line will be
            // treated as the start of a sub-list. What a kludge, huh? This is
            // an aspect of Markdown's syntax that's hard to parse perfectly
            // without resorting to mind-reading. Perhaps the solution is to
            // change the syntax rules such that sub-lists must start with a
            // starting cardinal number; e.g. "1." or "a.".

            g_list_level++;

            // trim trailing blank lines:
            list_str = list_str.replace(/\n{2,}$/, "\n");

            // attacklab: add sentinel to emulate \z
            list_str += "~0";

            // In the original attacklab showdown, list_type was not given to this function, and anything
            // that matched /[*+-]|\d+[.]/ would just create the next <li>, causing this mismatch:
            //
            //  Markdown          rendered by WMD        rendered by MarkdownSharp
            //  ------------------------------------------------------------------
            //  1. first          1. first               1. first
            //  2. second         2. second              2. second
            //  - third           3. third                   * third
            //
            // We changed this to behave identical to MarkdownSharp. This is the constructed RegEx,
            // with {MARKER} being one of \d+[.] or [*+-], depending on list_type:
        
            /*
            list_str = list_str.replace(/
                (^[ \t]*)                       // leading whitespace = $1
                ({MARKER}) [ \t]+               // list marker = $2
                ([^\r]+?                        // list item text   = $3
                    (\n+)
                )
                (?=
                    (~0 | \2 ({MARKER}) [ \t]+)
                )
            /gm, function(){...});
            */

            var marker = _listItemMarkers[list_type];
            var re = new RegExp("(^[ \\t]*)(?:" + marker + ")[ \\t]+([^\\r]+?(\\n+))(?=(~0|\\1(" + marker + ")[ \\t]+))", "gm");
            var last_item_had_a_double_newline = false;
            list_str = list_str.replace(re,
                function (wholeMatch, leading_space, item) {
                    var ends_with_double_newline = /\n\n$/.test(item);
                    var contains_double_newline = ends_with_double_newline || item.search(/\n{2,}/) > -1;

                    if (contains_double_newline || last_item_had_a_double_newline) {
                        item = _RunBlockGamut(_Outdent(item), /* doNotUnhash = */true);
                    }
                    else {
                        // Recursion for sub-lists:
                        item = _DoLists(_Outdent(item));
                        item = item.replace(/\n$/, ""); // chomp(item)
                        item = _RunSpanGamut(item);
                    }
                    last_item_had_a_double_newline = ends_with_double_newline;
                    return "<li>" + item + "</li>\n";
                }
            );

            // attacklab: strip sentinel
            list_str = list_str.replace(/~0/g, "");

            g_list_level--;
            return list_str;
        }

        function _DoCodeBlocks(text) {
            //
            //  Process Markdown `<pre><code>` blocks.
            //  

            /*
            text = text.replace(/
                (?:\n\n|^)
                (                               // $1 = the code block -- one or more lines, starting with a space/tab
                    (?:
                        (?:[ ]{4}|\t)           // Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
                        .*\n+
                    )+
                )
                (\n*[ ]{0,3}[^ \t\n]|(?=~0))    // attacklab: g_tab_width
            /g ,function(){...});
            */

            // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
            text += "~0";

            text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
                function (wholeMatch, m1, m2) {
                    var codeblock = m1;
                    var nextChar = m2;

                    codeblock = _EncodeCode(_Outdent(codeblock));
                    codeblock = _Detab(codeblock);
                    codeblock = codeblock.replace(/^\n+/g, ""); // trim leading newlines
                    codeblock = codeblock.replace(/\n+$/g, ""); // trim trailing whitespace

                    codeblock = "<pre><code>" + codeblock + "\n</code></pre>";

                    return "\n\n" + codeblock + "\n\n" + nextChar;
                }
            );

            // attacklab: strip sentinel
            text = text.replace(/~0/, "");

            return text;
        }

        function hashBlock(text) {
            text = text.replace(/(^\n+|\n+$)/g, "");
            return "\n\n~K" + (g_html_blocks.push(text) - 1) + "K\n\n";
        }

        function _DoCodeSpans(text) {
            //
            // * Backtick quotes are used for <code></code> spans.
            // 
            // * You can use multiple backticks as the delimiters if you want to
            //   include literal backticks in the code span. So, this input:
            //     
            //      Just type ``foo `bar` baz`` at the prompt.
            //     
            //   Will translate to:
            //     
            //      <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
            //     
            //   There's no arbitrary limit to the number of backticks you
            //   can use as delimters. If you need three consecutive backticks
            //   in your code, use four for delimiters, etc.
            //
            // * You can use spaces to get literal backticks at the edges:
            //     
            //      ... type `` `bar` `` ...
            //     
            //   Turns to:
            //     
            //      ... type <code>`bar`</code> ...
            //

            /*
            text = text.replace(/
                (^|[^\\])       // Character before opening ` can't be a backslash
                (`+)            // $2 = Opening run of `
                (               // $3 = The code block
                    [^\r]*?
                    [^`]        // attacklab: work around lack of lookbehind
                )
                \2              // Matching closer
                (?!`)
            /gm, function(){...});
            */

            text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
                function (wholeMatch, m1, _, c) {
                    c = c.replace(/^([ \t]*)/g, ""); // leading whitespace
                    c = c.replace(/[ \t]*$/g, ""); // trailing whitespace
                    c = _EncodeCode(c);
                    c = c.replace(/:\/\//g, "~P"); // to prevent auto-linking. Not necessary in code *blocks*, but in code spans. Will be converted back after the auto-linker runs.
                    return m1 + "<code>" + c + "</code>";
                }
            );

            return text;
        }

        function _EncodeCode(text) {
            //
            // Encode/escape certain characters inside Markdown code runs.
            // The point is that in code, these characters are literals,
            // and lose their special Markdown meanings.
            //
            // Encode all ampersands; HTML entities are not
            // entities within a Markdown code span.
            text = text.replace(/&/g, "&amp;");

            // Do the angle bracket song and dance:
            text = text.replace(/</g, "&lt;");
            text = text.replace(/>/g, "&gt;");

            // Now, escape characters that are magic in Markdown:
            text = escapeCharacters(text, "\*_{}[]\\", false);

            // jj the line above breaks this:
            //---

            //* Item

            //   1. Subitem

            //            special char: *
            //---

            return text;
        }

        function _DoItalicsAndBold(text) {

            // <strong> must go first:
            text = text.replace(/([\W_]|^)(\*\*|__)(?=\S)([^\r]*?\S[\*_]*)\2([\W_]|$)/g,
            "$1<strong>$3</strong>$4");

            text = text.replace(/([\W_]|^)(\*|_)(?=\S)([^\r\*_]*?\S)\2([\W_]|$)/g,
            "$1<em>$3</em>$4");

            return text;
        }

        function _DoBlockQuotes(text) {

            /*
            text = text.replace(/
                (                           // Wrap whole match in $1
                    (
                        ^[ \t]*>[ \t]?      // '>' at the start of a line
                        .+\n                // rest of the first line
                        (.+\n)*             // subsequent consecutive lines
                        \n*                 // blanks
                    )+
                )
            /gm, function(){...});
            */

            text = text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,
                function (wholeMatch, m1) {
                    var bq = m1;

                    // attacklab: hack around Konqueror 3.5.4 bug:
                    // "----------bug".replace(/^-/g,"") == "bug"

                    bq = bq.replace(/^[ \t]*>[ \t]?/gm, "~0"); // trim one level of quoting

                    // attacklab: clean up hack
                    bq = bq.replace(/~0/g, "");

                    bq = bq.replace(/^[ \t]+$/gm, "");     // trim whitespace-only lines
                    bq = _RunBlockGamut(bq);             // recurse

                    bq = bq.replace(/(^|\n)/g, "$1  ");
                    // These leading spaces screw with <pre> content, so we need to fix that:
                    bq = bq.replace(
                            /(\s*<pre>[^\r]+?<\/pre>)/gm,
                        function (wholeMatch, m1) {
                            var pre = m1;
                            // attacklab: hack around Konqueror 3.5.4 bug:
                            pre = pre.replace(/^  /mg, "~0");
                            pre = pre.replace(/~0/g, "");
                            return pre;
                        });

                    return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");
                }
            );
            return text;
        }

        function _FormParagraphs(text, doNotUnhash) {
            //
            //  Params:
            //    $text - string to process with html <p> tags
            //

            // Strip leading and trailing lines:
            text = text.replace(/^\n+/g, "");
            text = text.replace(/\n+$/g, "");

            var grafs = text.split(/\n{2,}/g);
            var grafsOut = [];
            
            var markerRe = /~K(\d+)K/;

            //
            // Wrap <p> tags.
            //
            var end = grafs.length;
            for (var i = 0; i < end; i++) {
                var str = grafs[i];

                // if this is an HTML marker, copy it
                if (markerRe.test(str)) {
                    grafsOut.push(str);
                }
                else if (/\S/.test(str)) {
                    str = _RunSpanGamut(str);
                    str = str.replace(/^([ \t]*)/g, "<p>");
                    str += "</p>"
                    grafsOut.push(str);
                }

            }
            //
            // Unhashify HTML blocks
            //
            if (!doNotUnhash) {
                end = grafsOut.length;
                for (var i = 0; i < end; i++) {
                    var foundAny = true;
                    while (foundAny) { // we may need several runs, since the data may be nested
                        foundAny = false;
                        grafsOut[i] = grafsOut[i].replace(/~K(\d+)K/g, function (wholeMatch, id) {
                            foundAny = true;
                            return g_html_blocks[id];
                        });
                    }
                }
            }
            return grafsOut.join("\n\n");
        }

        function _EncodeAmpsAndAngles(text) {
            // Smart processing for ampersands and angle brackets that need to be encoded.

            // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
            //   http://bumppo.net/projects/amputator/
            text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;");

            // Encode naked <'s
            text = text.replace(/<(?![a-z\/?\$!])/gi, "&lt;");

            return text;
        }

        function _EncodeBackslashEscapes(text) {
            //
            //   Parameter:  String.
            //   Returns:    The string, with after processing the following backslash
            //               escape sequences.
            //

            // attacklab: The polite way to do this is with the new
            // escapeCharacters() function:
            //
            //     text = escapeCharacters(text,"\\",true);
            //     text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
            //
            // ...but we're sidestepping its use of the (slow) RegExp constructor
            // as an optimization for Firefox.  This function gets called a LOT.

            text = text.replace(/\\(\\)/g, escapeCharacters_callback);
            text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g, escapeCharacters_callback);
            return text;
        }

        function _DoAutoLinks(text) {

            // note that at this point, all other URL in the text are already hyperlinked as <a href=""></a>
            // *except* for the <http://www.foo.com> case

            // automatically add < and > around unadorned raw hyperlinks
            // must be preceded by space/BOF and followed by non-word/EOF character    
            text = text.replace(/(^|\s)(https?|ftp)(:\/\/[-A-Z0-9+&@#\/%?=~_|\[\]\(\)!:,\.;]*[-A-Z0-9+&@#\/%=~_|\[\]])($|\W)/gi, "$1<$2$3>$4");

            //  autolink anything like <http://example.com>
            
            var replacer = function (wholematch, m1) { return "<a href=\"" + m1 + "\">" + pluginHooks.plainLinkText(m1) + "</a>"; }
            text = text.replace(/<((https?|ftp):[^'">\s]+)>/gi, replacer);

            // Email addresses: <address@domain.foo>
            /*
            text = text.replace(/
                <
                (?:mailto:)?
                (
                    [-.\w]+
                    \@
                    [-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
                )
                >
            /gi, _DoAutoLinks_callback());
            */

            /* disabling email autolinking, since we don't do that on the server, either
            text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,
                function(wholeMatch,m1) {
                    return _EncodeEmailAddress( _UnescapeSpecialChars(m1) );
                }
            );
            */
            return text;
        }

        function _UnescapeSpecialChars(text) {
            //
            // Swap back in all the special characters we've hidden.
            //
            text = text.replace(/~E(\d+)E/g,
                function (wholeMatch, m1) {
                    var charCodeToReplace = parseInt(m1);
                    return String.fromCharCode(charCodeToReplace);
                }
            );
            return text;
        }

        function _Outdent(text) {
            //
            // Remove one level of line-leading tabs or spaces
            //

            // attacklab: hack around Konqueror 3.5.4 bug:
            // "----------bug".replace(/^-/g,"") == "bug"

            text = text.replace(/^(\t|[ ]{1,4})/gm, "~0"); // attacklab: g_tab_width

            // attacklab: clean up hack
            text = text.replace(/~0/g, "")

            return text;
        }

        function _Detab(text) {
            if (!/\t/.test(text))
                return text;

            var spaces = ["    ", "   ", "  ", " "],
            skew = 0,
            v;

            return text.replace(/[\n\t]/g, function (match, offset) {
                if (match === "\n") {
                    skew = offset + 1;
                    return match;
                }
                v = (offset - skew) % 4;
                skew = offset + 1;
                return spaces[v];
            });
        }

        //
        //  attacklab: Utility functions
        //

        var _problemUrlChars = /(?:["'*()[\]:]|~D)/g;

        // hex-encodes some unusual "problem" chars in URLs to avoid URL detection problems 
        function encodeProblemUrlChars(url) {
            if (!url)
                return "";

            var len = url.length;

            return url.replace(_problemUrlChars, function (match, offset) {
                if (match == "~D") // escape for dollar
                    return "%24";
                if (match == ":") {
                    if (offset == len - 1 || /[0-9\/]/.test(url.charAt(offset + 1)))
                        return ":"
                }
                return "%" + match.charCodeAt(0).toString(16);
            });
        }


        function escapeCharacters(text, charsToEscape, afterBackslash) {
            // First we have to escape the escape characters so that
            // we can build a character class out of them
            var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g, "\\$1") + "])";

            if (afterBackslash) {
                regexString = "\\\\" + regexString;
            }

            var regex = new RegExp(regexString, "g");
            text = text.replace(regex, escapeCharacters_callback);

            return text;
        }


        function escapeCharacters_callback(wholeMatch, m1) {
            var charCodeToEscape = m1.charCodeAt(0);
            return "~E" + charCodeToEscape + "E";
        }

    }; // end of the Markdown.Converter constructor

})();


//Markdown.sanitizer
(function () {
    var output, Converter;
    if (typeof exports === "object" && typeof require === "function") { // we're in a CommonJS (e.g. Node.js) module
        output = exports;
        Converter = require("./Markdown.Converter").Converter;
    } else {
        output = Markdown;
        Converter = output.Converter;
    }
        
    output.getSanitizingConverter = function (converter) {
        converter = converter || new Converter();
        converter.hooks.chain("postConversion", sanitizeHtml);
        converter.hooks.chain("postConversion", balanceTags);
        return converter;
    }

    function sanitizeHtml(html) {
        return html.replace(/<[^><]*>?/gi, sanitizeTag);
    }

    // (tags that can be opened/closed) | (tags that stand alone)
    var basicTagWhitelist = /^(<\/?(b|blockquote|code|del|dd|dl|dt|em|h1|h2|h3|i|kbd|li|ol|p|pre|s|sup|sub|strong|strike|ul)>|<(br|hr)\s?\/?>)$/i;
    // <a href="url..." optional title>|</a>
    var aWhite = /^(<a\shref="((https?|ftp):\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)]+"(\stitle="[^"<>]+")?\s?>|<\/a>)$/i;

    // <img src="url..." optional width  optional height  optional alt  optional title
    var imgWhite = /^(<img\ssrc="(https?:\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)]+"(\swidth="\d{1,3}")?(\sheight="\d{1,3}")?(\salt="[^"<>]*")?(\stitle="[^"<>]*")?\s?\/?>)$/i;

    function sanitizeTag(tag) {
        if (tag.match(basicTagWhitelist) || tag.match(aWhite) || tag.match(imgWhite))
            return tag;
        else
            return tag.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
    }

    /// <summary>
    /// attempt to balance HTML tags in the html string
    /// by removing any unmatched opening or closing tags
    /// IMPORTANT: we *assume* HTML has *already* been 
    /// sanitized and is safe/sane before balancing!
    /// 
    /// adapted from CODESNIPPET: A8591DBA-D1D3-11DE-947C-BA5556D89593
    /// </summary>
    function balanceTags(html) {

        if (html == "")
            return "";

        var re = /<\/?\w+[^>]*(\s|$|>)/g;
        // convert everything to lower case; this makes
        // our case insensitive comparisons easier
        var tags = html.toLowerCase().match(re);

        // no HTML tags present? nothing to do; exit now
        var tagcount = (tags || []).length;
        if (tagcount == 0)
            return html;

        var tagname, tag;
        var ignoredtags = "<p><img><br><li><hr>";
        var match;
        var tagpaired = [];
        var tagremove = [];
        var needsRemoval = false;

        // loop through matched tags in forward order
        for (var ctag = 0; ctag < tagcount; ctag++) {
            tagname = tags[ctag].replace(/<\/?(\w+).*/, "$1");
            // skip any already paired tags
            // and skip tags in our ignore list; assume they're self-closed
            if (tagpaired[ctag] || ignoredtags.search("<" + tagname + ">") > -1)
                continue;

            tag = tags[ctag];
            match = -1;

            if (!/^<\//.test(tag)) {
                // this is an opening tag
                // search forwards (next tags), look for closing tags
                for (var ntag = ctag + 1; ntag < tagcount; ntag++) {
                    if (!tagpaired[ntag] && tags[ntag] == "</" + tagname + ">") {
                        match = ntag;
                        break;
                    }
                }
            }

            if (match == -1)
                needsRemoval = tagremove[ctag] = true; // mark for removal
            else
                tagpaired[match] = true; // mark paired
        }

        if (!needsRemoval)
            return html;

        // delete all orphaned tags from the string

        var ctag = 0;
        html = html.replace(re, function (match) {
            var res = tagremove[ctag] ? "" : match;
            ctag++;
            return res;
        });
        return html;
    }
})();

//Markdown.editor
﻿// needs Markdown.Converter.js at the moment

(function () {

    var util = {},
        position = {},
        ui = {},
        doc = window.document,
        re = window.RegExp,
        nav = window.navigator,
        SETTINGS = { lineLength: 72 };

    // Used to work around some browser bugs where we can't use feature testing.
    var isIE = /msie/.test(nav.userAgent.toLowerCase());

    var defaultsStrings = {
        bold: "Strong <strong> Ctrl+B",
        boldexample: "strong text",

        italic: "Emphasis <em> Ctrl+I",
        italicexample: "emphasized text",

        link: "Hyperlink <a> Ctrl+L",
        linkdescription: "enter link description here",
        linkdialog: "<p><b>Insert Hyperlink</b></p><p>http://example.com/ \"optional title\"</p>",

        quote: "Blockquote <blockquote> Ctrl+Q",
        quoteexample: "Blockquote",

        code: "Code Sample <pre><code> Ctrl+K",
        codeexample: "enter code here",

        image: "Image <img> Ctrl+G",
        imagedescription: "enter image description here",
        imagedialog: "<p><b>Insert Image</b></p><p>http://example.com/images/diagram.jpg \"optional title\"<br><br>Need <a href='http://www.google.com/search?q=free+image+hosting' target='_blank'>free image hosting?</a></p>",

        olist: "Numbered List <ol> Ctrl+O",
        ulist: "Bulleted List <ul> Ctrl+U",
        litem: "List item",

        heading: "Heading <h1>/<h2> Ctrl+H",
        headingexample: "Heading",

        hr: "Horizontal Rule <hr> Ctrl+R",

        undo: "Undo - Ctrl+Z",
        redo: "Redo - Ctrl+Y",
        redomac: "Redo - Ctrl+Shift+Z",

        help: "Markdown Editing Help"
    };


    // -------------------------------------------------------------------
    //  YOUR CHANGES GO HERE
    //
    // I've tried to localize the things you are likely to change to
    // this area.
    // -------------------------------------------------------------------

    // The default text that appears in the dialog input box when entering
    // links.
    var imageDefaultText = "http://";
    var linkDefaultText = "http://";

    // -------------------------------------------------------------------
    //  END OF YOUR CHANGES
    // -------------------------------------------------------------------

    // options, if given, can have the following properties:
    //   options.helpButton = { handler: yourEventHandler }
    //   options.strings = { italicexample: "slanted text" }
    // `yourEventHandler` is the click handler for the help button.
    // If `options.helpButton` isn't given, not help button is created.
    // `options.strings` can have any or all of the same properties as
    // `defaultStrings` above, so you can just override some string displayed
    // to the user on a case-by-case basis, or translate all strings to
    // a different language.
    //
    // For backwards compatibility reasons, the `options` argument can also
    // be just the `helpButton` object, and `strings.help` can also be set via
    // `helpButton.title`. This should be considered legacy.
    //
    // The constructed editor object has the methods:
    // - getConverter() returns the markdown converter object that was passed to the constructor
    // - run() actually starts the editor; should be called after all necessary plugins are registered. Calling this more than once is a no-op.
    // - refreshPreview() forces the preview to be updated. This method is only available after run() was called.
    Markdown.Editor = function (markdownConverter, idPostfix, options) {
        
        options = options || {};

        options.strings = options.strings || {};
        if (options.helpButton) {
            options.strings.help = options.strings.help || options.helpButton.title;
        }
        var getString = function (identifier) { return options.strings[identifier] || defaultsStrings[identifier]; }

        idPostfix = idPostfix || "";

        var hooks = this.hooks = new Markdown.HookCollection();
        hooks.addNoop("onPreviewRefresh");       // called with no arguments after the preview has been refreshed
        hooks.addNoop("postBlockquoteCreation"); // called with the user's selection *after* the blockquote was created; should return the actual to-be-inserted text
        hooks.addFalse("insertImageDialog");     /* called with one parameter: a callback to be called with the URL of the image. If the application creates
                                                  * its own image insertion dialog, this hook should return true, and the callback should be called with the chosen
                                                  * image url (or null if the user cancelled). If this hook returns false, the default dialog will be used.
                                                  */

        this.getConverter = function () { return markdownConverter; }

        var that = this,
            panels;

        this.run = function () {
            if (panels)
                return; // already initialized

            panels = new PanelCollection(idPostfix);
            var commandManager = new CommandManager(hooks, getString);
            var previewManager = new PreviewManager(markdownConverter, panels, function () { hooks.onPreviewRefresh(); });
            var undoManager, uiManager;

            if (!/\?noundo/.test(doc.location.href)) {
                undoManager = new UndoManager(function () {
                    previewManager.refresh();
                    if (uiManager) // not available on the first call
                        uiManager.setUndoRedoButtonStates();
                }, panels);
                this.textOperation = function (f) {
                    undoManager.setCommandMode();
                    f();
                    that.refreshPreview();
                }
            }

            uiManager = new UIManager(idPostfix, panels, undoManager, previewManager, commandManager, options.helpButton, getString);
            uiManager.setUndoRedoButtonStates();

            var forceRefresh = that.refreshPreview = function () { previewManager.refresh(true); };

            forceRefresh();
        };

    }

    // before: contains all the text in the input box BEFORE the selection.
    // after: contains all the text in the input box AFTER the selection.
    function Chunks() { }

    // startRegex: a regular expression to find the start tag
    // endRegex: a regular expresssion to find the end tag
    Chunks.prototype.findTags = function (startRegex, endRegex) {

        var chunkObj = this;
        var regex;

        if (startRegex) {

            regex = util.extendRegExp(startRegex, "", "$");

            this.before = this.before.replace(regex,
                function (match) {
                    chunkObj.startTag = chunkObj.startTag + match;
                    return "";
                });

            regex = util.extendRegExp(startRegex, "^", "");

            this.selection = this.selection.replace(regex,
                function (match) {
                    chunkObj.startTag = chunkObj.startTag + match;
                    return "";
                });
        }

        if (endRegex) {

            regex = util.extendRegExp(endRegex, "", "$");

            this.selection = this.selection.replace(regex,
                function (match) {
                    chunkObj.endTag = match + chunkObj.endTag;
                    return "";
                });

            regex = util.extendRegExp(endRegex, "^", "");

            this.after = this.after.replace(regex,
                function (match) {
                    chunkObj.endTag = match + chunkObj.endTag;
                    return "";
                });
        }
    };

    // If remove is false, the whitespace is transferred
    // to the before/after regions.
    //
    // If remove is true, the whitespace disappears.
    Chunks.prototype.trimWhitespace = function (remove) {
        var beforeReplacer, afterReplacer, that = this;
        if (remove) {
            beforeReplacer = afterReplacer = "";
        } else {
            beforeReplacer = function (s) { that.before += s; return ""; }
            afterReplacer = function (s) { that.after = s + that.after; return ""; }
        }

        this.selection = this.selection.replace(/^(\s*)/, beforeReplacer).replace(/(\s*)$/, afterReplacer);
    };


    Chunks.prototype.skipLines = function (nLinesBefore, nLinesAfter, findExtraNewlines) {

        if (nLinesBefore === undefined) {
            nLinesBefore = 1;
        }

        if (nLinesAfter === undefined) {
            nLinesAfter = 1;
        }

        nLinesBefore++;
        nLinesAfter++;

        var regexText;
        var replacementText;

        // chrome bug ... documented at: http://meta.stackoverflow.com/questions/63307/blockquote-glitch-in-editor-in-chrome-6-and-7/65985#65985
        if (navigator.userAgent.match(/Chrome/)) {
            "X".match(/()./);
        }

        this.selection = this.selection.replace(/(^\n*)/, "");

        this.startTag = this.startTag + re.$1;

        this.selection = this.selection.replace(/(\n*$)/, "");
        this.endTag = this.endTag + re.$1;
        this.startTag = this.startTag.replace(/(^\n*)/, "");
        this.before = this.before + re.$1;
        this.endTag = this.endTag.replace(/(\n*$)/, "");
        this.after = this.after + re.$1;

        if (this.before) {

            regexText = replacementText = "";

            while (nLinesBefore--) {
                regexText += "\\n?";
                replacementText += "\n";
            }

            if (findExtraNewlines) {
                regexText = "\\n*";
            }
            this.before = this.before.replace(new re(regexText + "$", ""), replacementText);
        }

        if (this.after) {

            regexText = replacementText = "";

            while (nLinesAfter--) {
                regexText += "\\n?";
                replacementText += "\n";
            }
            if (findExtraNewlines) {
                regexText = "\\n*";
            }

            this.after = this.after.replace(new re(regexText, ""), replacementText);
        }
    };

    // end of Chunks

    // A collection of the important regions on the page.
    // Cached so we don't have to keep traversing the DOM.
    // Also holds ieCachedRange and ieCachedScrollTop, where necessary; working around
    // this issue:
    // Internet explorer has problems with CSS sprite buttons that use HTML
    // lists.  When you click on the background image "button", IE will
    // select the non-existent link text and discard the selection in the
    // textarea.  The solution to this is to cache the textarea selection
    // on the button's mousedown event and set a flag.  In the part of the
    // code where we need to grab the selection, we check for the flag
    // and, if it's set, use the cached area instead of querying the
    // textarea.
    //
    // This ONLY affects Internet Explorer (tested on versions 6, 7
    // and 8) and ONLY on button clicks.  Keyboard shortcuts work
    // normally since the focus never leaves the textarea.
    function PanelCollection(postfix) {
        this.buttonBar = doc.getElementById("wmd-button-bar" + postfix);
        this.preview = doc.getElementById("wmd-preview" + postfix);
        this.input = doc.getElementById("wmd-input" + postfix);
    };

    // Returns true if the DOM element is visible, false if it's hidden.
    // Checks if display is anything other than none.
    util.isVisible = function (elem) {

        if (window.getComputedStyle) {
            // Most browsers
            return window.getComputedStyle(elem, null).getPropertyValue("display") !== "none";
        }
        else if (elem.currentStyle) {
            // IE
            return elem.currentStyle["display"] !== "none";
        }
    };


    // Adds a listener callback to a DOM element which is fired on a specified
    // event.
    util.addEvent = function (elem, event, listener) {
        if (elem.attachEvent) {
            // IE only.  The "on" is mandatory.
            elem.attachEvent("on" + event, listener);
        }
        else {
            // Other browsers.
            elem.addEventListener(event, listener, false);
        }
    };


    // Removes a listener callback from a DOM element which is fired on a specified
    // event.
    util.removeEvent = function (elem, event, listener) {
        if (elem.detachEvent) {
            // IE only.  The "on" is mandatory.
            elem.detachEvent("on" + event, listener);
        }
        else {
            // Other browsers.
            elem.removeEventListener(event, listener, false);
        }
    };

    // Converts \r\n and \r to \n.
    util.fixEolChars = function (text) {
        text = text.replace(/\r\n/g, "\n");
        text = text.replace(/\r/g, "\n");
        return text;
    };

    // Extends a regular expression.  Returns a new RegExp
    // using pre + regex + post as the expression.
    // Used in a few functions where we have a base
    // expression and we want to pre- or append some
    // conditions to it (e.g. adding "$" to the end).
    // The flags are unchanged.
    //
    // regex is a RegExp, pre and post are strings.
    util.extendRegExp = function (regex, pre, post) {

        if (pre === null || pre === undefined) {
            pre = "";
        }
        if (post === null || post === undefined) {
            post = "";
        }

        var pattern = regex.toString();
        var flags;

        // Replace the flags with empty space and store them.
        pattern = pattern.replace(/\/([gim]*)$/, function (wholeMatch, flagsPart) {
            flags = flagsPart;
            return "";
        });

        // Remove the slash delimiters on the regular expression.
        pattern = pattern.replace(/(^\/|\/$)/g, "");
        pattern = pre + pattern + post;

        return new re(pattern, flags);
    }

    // UNFINISHED
    // The assignment in the while loop makes jslint cranky.
    // I'll change it to a better loop later.
    position.getTop = function (elem, isInner) {
        var result = elem.offsetTop;
        if (!isInner) {
            while (elem = elem.offsetParent) {
                result += elem.offsetTop;
            }
        }
        return result;
    };

    position.getHeight = function (elem) {
        return elem.offsetHeight || elem.scrollHeight;
    };

    position.getWidth = function (elem) {
        return elem.offsetWidth || elem.scrollWidth;
    };

    position.getPageSize = function () {

        var scrollWidth, scrollHeight;
        var innerWidth, innerHeight;

        // It's not very clear which blocks work with which browsers.
        if (self.innerHeight && self.scrollMaxY) {
            scrollWidth = doc.body.scrollWidth;
            scrollHeight = self.innerHeight + self.scrollMaxY;
        }
        else if (doc.body.scrollHeight > doc.body.offsetHeight) {
            scrollWidth = doc.body.scrollWidth;
            scrollHeight = doc.body.scrollHeight;
        }
        else {
            scrollWidth = doc.body.offsetWidth;
            scrollHeight = doc.body.offsetHeight;
        }

        if (self.innerHeight) {
            // Non-IE browser
            innerWidth = self.innerWidth;
            innerHeight = self.innerHeight;
        }
        else if (doc.documentElement && doc.documentElement.clientHeight) {
            // Some versions of IE (IE 6 w/ a DOCTYPE declaration)
            innerWidth = doc.documentElement.clientWidth;
            innerHeight = doc.documentElement.clientHeight;
        }
        else if (doc.body) {
            // Other versions of IE
            innerWidth = doc.body.clientWidth;
            innerHeight = doc.body.clientHeight;
        }

        var maxWidth = Math.max(scrollWidth, innerWidth);
        var maxHeight = Math.max(scrollHeight, innerHeight);
        return [maxWidth, maxHeight, innerWidth, innerHeight];
    };

    // Handles pushing and popping TextareaStates for undo/redo commands.
    // I should rename the stack variables to list.
    function UndoManager(callback, panels) {

        var undoObj = this;
        var undoStack = []; // A stack of undo states
        var stackPtr = 0; // The index of the current state
        var mode = "none";
        var lastState; // The last state
        var timer; // The setTimeout handle for cancelling the timer
        var inputStateObj;

        // Set the mode for later logic steps.
        var setMode = function (newMode, noSave) {
            if (mode != newMode) {
                mode = newMode;
                if (!noSave) {
                    saveState();
                }
            }

            if (!isIE || mode != "moving") {
                timer = setTimeout(refreshState, 1);
            }
            else {
                inputStateObj = null;
            }
        };

        var refreshState = function (isInitialState) {
            inputStateObj = new TextareaState(panels, isInitialState);
            timer = undefined;
        };

        this.setCommandMode = function () {
            mode = "command";
            saveState();
            timer = setTimeout(refreshState, 0);
        };

        this.canUndo = function () {
            return stackPtr > 1;
        };

        this.canRedo = function () {
            if (undoStack[stackPtr + 1]) {
                return true;
            }
            return false;
        };

        // Removes the last state and restores it.
        this.undo = function () {

            if (undoObj.canUndo()) {
                if (lastState) {
                    // What about setting state -1 to null or checking for undefined?
                    lastState.restore();
                    lastState = null;
                }
                else {
                    undoStack[stackPtr] = new TextareaState(panels);
                    undoStack[--stackPtr].restore();

                    if (callback) {
                        callback();
                    }
                }
            }

            mode = "none";
            panels.input.focus();
            refreshState();
        };

        // Redo an action.
        this.redo = function () {

            if (undoObj.canRedo()) {

                undoStack[++stackPtr].restore();

                if (callback) {
                    callback();
                }
            }

            mode = "none";
            panels.input.focus();
            refreshState();
        };

        // Push the input area state to the stack.
        var saveState = function () {
            var currState = inputStateObj || new TextareaState(panels);

            if (!currState) {
                return false;
            }
            if (mode == "moving") {
                if (!lastState) {
                    lastState = currState;
                }
                return;
            }
            if (lastState) {
                if (undoStack[stackPtr - 1].text != lastState.text) {
                    undoStack[stackPtr++] = lastState;
                }
                lastState = null;
            }
            undoStack[stackPtr++] = currState;
            undoStack[stackPtr + 1] = null;
            if (callback) {
                callback();
            }
        };

        var handleCtrlYZ = function (event) {

            var handled = false;

            if (event.ctrlKey || event.metaKey) {

                // IE and Opera do not support charCode.
                var keyCode = event.charCode || event.keyCode;
                var keyCodeChar = String.fromCharCode(keyCode);

                switch (keyCodeChar.toLowerCase()) {

                    case "y":
                        undoObj.redo();
                        handled = true;
                        break;

                    case "z":
                        if (!event.shiftKey) {
                            undoObj.undo();
                        }
                        else {
                            undoObj.redo();
                        }
                        handled = true;
                        break;
                }
            }

            if (handled) {
                if (event.preventDefault) {
                    event.preventDefault();
                }
                if (window.event) {
                    window.event.returnValue = false;
                }
                return;
            }
        };

        // Set the mode depending on what is going on in the input area.
        var handleModeChange = function (event) {

            if (!event.ctrlKey && !event.metaKey) {

                var keyCode = event.keyCode;

                if ((keyCode >= 33 && keyCode <= 40) || (keyCode >= 63232 && keyCode <= 63235)) {
                    // 33 - 40: page up/dn and arrow keys
                    // 63232 - 63235: page up/dn and arrow keys on safari
                    setMode("moving");
                }
                else if (keyCode == 8 || keyCode == 46 || keyCode == 127) {
                    // 8: backspace
                    // 46: delete
                    // 127: delete
                    setMode("deleting");
                }
                else if (keyCode == 13) {
                    // 13: Enter
                    setMode("newlines");
                }
                else if (keyCode == 27) {
                    // 27: escape
                    setMode("escape");
                }
                else if ((keyCode < 16 || keyCode > 20) && keyCode != 91) {
                    // 16-20 are shift, etc.
                    // 91: left window key
                    // I think this might be a little messed up since there are
                    // a lot of nonprinting keys above 20.
                    setMode("typing");
                }
            }
        };

        var setEventHandlers = function () {
            util.addEvent(panels.input, "keypress", function (event) {
                // keyCode 89: y
                // keyCode 90: z
                if ((event.ctrlKey || event.metaKey) && (event.keyCode == 89 || event.keyCode == 90)) {
                    event.preventDefault();
                }
            });

            var handlePaste = function () {
                if (isIE || (inputStateObj && inputStateObj.text != panels.input.value)) {
                    if (timer == undefined) {
                        mode = "paste";
                        saveState();
                        refreshState();
                    }
                }
            };

            util.addEvent(panels.input, "keydown", handleCtrlYZ);
            util.addEvent(panels.input, "keydown", handleModeChange);
            util.addEvent(panels.input, "mousedown", function () {
                setMode("moving");
            });

            panels.input.onpaste = handlePaste;
            panels.input.ondrop = handlePaste;
        };

        var init = function () {
            setEventHandlers();
            refreshState(true);
            saveState();
        };

        init();
    }

    // end of UndoManager

    // The input textarea state/contents.
    // This is used to implement undo/redo by the undo manager.
    function TextareaState(panels, isInitialState) {

        // Aliases
        var stateObj = this;
        var inputArea = panels.input;
        this.init = function () {
            if (!util.isVisible(inputArea)) {
                return;
            }
            if (!isInitialState && doc.activeElement && doc.activeElement !== inputArea) { // this happens when tabbing out of the input box
                return;
            }

            this.setInputAreaSelectionStartEnd();
            this.scrollTop = inputArea.scrollTop;
            if (!this.text && inputArea.selectionStart || inputArea.selectionStart === 0) {
                this.text = inputArea.value;
            }

        }

        // Sets the selected text in the input box after we've performed an
        // operation.
        this.setInputAreaSelection = function () {

            if (!util.isVisible(inputArea)) {
                return;
            }

            if (inputArea.selectionStart !== undefined) {

                inputArea.focus();
                inputArea.selectionStart = stateObj.start;
                inputArea.selectionEnd = stateObj.end;
                inputArea.scrollTop = stateObj.scrollTop;
            }
            else if (doc.selection) {

                if (doc.activeElement && doc.activeElement !== inputArea) {
                    return;
                }

                inputArea.focus();
                var range = inputArea.createTextRange();
                range.moveStart("character", -inputArea.value.length);
                range.moveEnd("character", -inputArea.value.length);
                range.moveEnd("character", stateObj.end);
                range.moveStart("character", stateObj.start);
                range.select();
            }
        };

        this.setInputAreaSelectionStartEnd = function () {

            if (!panels.ieCachedRange && (inputArea.selectionStart || inputArea.selectionStart === 0)) {

                stateObj.start = inputArea.selectionStart;
                stateObj.end = inputArea.selectionEnd;
            }
            else if (doc.selection) {

                stateObj.text = util.fixEolChars(inputArea.value);

                // IE loses the selection in the textarea when buttons are
                // clicked.  On IE we cache the selection. Here, if something is cached,
                // we take it.
                var range = panels.ieCachedRange || doc.selection.createRange();

                var fixedRange = util.fixEolChars(range.text);
                var marker = "\x07";
                var markedRange = marker + fixedRange + marker;
                range.text = markedRange;
                var inputText = util.fixEolChars(inputArea.value);

                range.moveStart("character", -markedRange.length);
                range.text = fixedRange;

                stateObj.start = inputText.indexOf(marker);
                stateObj.end = inputText.lastIndexOf(marker) - marker.length;

                var len = stateObj.text.length - util.fixEolChars(inputArea.value).length;

                if (len) {
                    range.moveStart("character", -fixedRange.length);
                    while (len--) {
                        fixedRange += "\n";
                        stateObj.end += 1;
                    }
                    range.text = fixedRange;
                }

                if (panels.ieCachedRange)
                    stateObj.scrollTop = panels.ieCachedScrollTop; // this is set alongside with ieCachedRange

                panels.ieCachedRange = null;

                this.setInputAreaSelection();
            }
        };

        // Restore this state into the input area.
        this.restore = function () {

            if (stateObj.text != undefined && stateObj.text != inputArea.value) {
                inputArea.value = stateObj.text;
            }
            this.setInputAreaSelection();
            inputArea.scrollTop = stateObj.scrollTop;
        };

        // Gets a collection of HTML chunks from the inptut textarea.
        this.getChunks = function () {

            var chunk = new Chunks();
            chunk.before = util.fixEolChars(stateObj.text.substring(0, stateObj.start));
            chunk.startTag = "";
            chunk.selection = util.fixEolChars(stateObj.text.substring(stateObj.start, stateObj.end));
            chunk.endTag = "";
            chunk.after = util.fixEolChars(stateObj.text.substring(stateObj.end));
            chunk.scrollTop = stateObj.scrollTop;

            return chunk;
        };

        // Sets the TextareaState properties given a chunk of markdown.
        this.setChunks = function (chunk) {

            chunk.before = chunk.before + chunk.startTag;
            chunk.after = chunk.endTag + chunk.after;

            this.start = chunk.before.length;
            this.end = chunk.before.length + chunk.selection.length;
            this.text = chunk.before + chunk.selection + chunk.after;
            this.scrollTop = chunk.scrollTop;
        };
        this.init();
    };

    function PreviewManager(converter, panels, previewRefreshCallback) {

        var timeout;
        var elapsedTime;
        var oldInputText;
        var maxDelay = 3000;
        var startType = "delayed"; // The other legal value is "manual"

        // Adds event listeners to elements
        var setupEvents = function (inputElem, listener) {

            util.addEvent(inputElem, "input", listener);
            inputElem.onpaste = listener;
            inputElem.ondrop = listener;

            util.addEvent(inputElem, "keypress", listener);
            util.addEvent(inputElem, "keydown", listener);
        };

        var getDocScrollTop = function () {

            var result = 0;

            if (window.innerHeight) {
                result = window.pageYOffset;
            }
            else
                if (doc.documentElement && doc.documentElement.scrollTop) {
                    result = doc.documentElement.scrollTop;
                }
                else
                    if (doc.body) {
                        result = doc.body.scrollTop;
                    }

            return result;
        };

        var makePreviewHtml = function () {

            // If there is no registered preview panel
            // there is nothing to do.
            if (!panels.preview)
                return;


            var text = panels.input.value;
            if (text && text == oldInputText) {
                return; // Input text hasn't changed.
            }
            else {
                oldInputText = text;
            }

            var prevTime = new Date().getTime();

            text = converter.makeHtml(text);

            // Calculate the processing time of the HTML creation.
            // It's used as the delay time in the event listener.
            var currTime = new Date().getTime();
            elapsedTime = currTime - prevTime;

            pushPreviewHtml(text);
        };

        // setTimeout is already used.  Used as an event listener.
        var applyTimeout = function () {

            if (timeout) {
                clearTimeout(timeout);
                timeout = undefined;
            }

            if (startType !== "manual") {

                var delay = 0;

                if (startType === "delayed") {
                    delay = elapsedTime;
                }

                if (delay > maxDelay) {
                    delay = maxDelay;
                }
                timeout = setTimeout(makePreviewHtml, delay);
            }
        };

        var getScaleFactor = function (panel) {
            if (panel.scrollHeight <= panel.clientHeight) {
                return 1;
            }
            return panel.scrollTop / (panel.scrollHeight - panel.clientHeight);
        };

        var setPanelScrollTops = function () {
            if (panels.preview) {
                panels.preview.scrollTop = (panels.preview.scrollHeight - panels.preview.clientHeight) * getScaleFactor(panels.preview);
            }
        };

        this.refresh = function (requiresRefresh) {

            if (requiresRefresh) {
                oldInputText = "";
                makePreviewHtml();
            }
            else {
                applyTimeout();
            }
        };

        this.processingTime = function () {
            return elapsedTime;
        };

        var isFirstTimeFilled = true;

        // IE doesn't let you use innerHTML if the element is contained somewhere in a table
        // (which is the case for inline editing) -- in that case, detach the element, set the
        // value, and reattach. Yes, that *is* ridiculous.
        var ieSafePreviewSet = function (text) {
            var preview = panels.preview;
            var parent = preview.parentNode;
            var sibling = preview.nextSibling;
            parent.removeChild(preview);
            preview.innerHTML = text;
            if (!sibling)
                parent.appendChild(preview);
            else
                parent.insertBefore(preview, sibling);
        }

        var nonSuckyBrowserPreviewSet = function (text) {
            panels.preview.innerHTML = text;
        }

        var previewSetter;

        var previewSet = function (text) {
            if (previewSetter)
                return previewSetter(text);

            try {
                nonSuckyBrowserPreviewSet(text);
                previewSetter = nonSuckyBrowserPreviewSet;
            } catch (e) {
                previewSetter = ieSafePreviewSet;
                previewSetter(text);
            }
        };

        var pushPreviewHtml = function (text) {

            var emptyTop = position.getTop(panels.input) - getDocScrollTop();

            if (panels.preview) {
                previewSet(text);
                previewRefreshCallback();
            }

            setPanelScrollTops();

            if (isFirstTimeFilled) {
                isFirstTimeFilled = false;
                return;
            }

            var fullTop = position.getTop(panels.input) - getDocScrollTop();

            if (isIE) {
                setTimeout(function () {
                    window.scrollBy(0, fullTop - emptyTop);
                }, 0);
            }
            else {
                window.scrollBy(0, fullTop - emptyTop);
            }
        };

        var init = function () {

            setupEvents(panels.input, applyTimeout);
            makePreviewHtml();

            if (panels.preview) {
                panels.preview.scrollTop = 0;
            }
        };

        init();
    };

    // Creates the background behind the hyperlink text entry box.
    // And download dialog
    // Most of this has been moved to CSS but the div creation and
    // browser-specific hacks remain here.
    ui.createBackground = function () {

        var background = doc.createElement("div"),
            style = background.style;
        
        background.className = "wmd-prompt-background";
        
        style.position = "absolute";
        style.top = "0";

        style.zIndex = "1000";

        if (isIE) {
            style.filter = "alpha(opacity=50)";
        }
        else {
            style.opacity = "0.5";
        }

        var pageSize = position.getPageSize();
        style.height = pageSize[1] + "px";

        if (isIE) {
            style.left = doc.documentElement.scrollLeft;
            style.width = doc.documentElement.clientWidth;
        }
        else {
            style.left = "0";
            style.width = "100%";
        }

        doc.body.appendChild(background);
        return background;
    };

    // This simulates a modal dialog box and asks for the URL when you
    // click the hyperlink or image buttons.
    //
    // text: The html for the input box.
    // defaultInputText: The default value that appears in the input box.
    // callback: The function which is executed when the prompt is dismissed, either via OK or Cancel.
    //      It receives a single argument; either the entered text (if OK was chosen) or null (if Cancel
    //      was chosen).
    ui.prompt = function (text, defaultInputText, callback) {

        // These variables need to be declared at this level since they are used
        // in multiple functions.
        var dialog;         // The dialog box.
        var input;         // The text box where you enter the hyperlink.


        if (defaultInputText === undefined) {
            defaultInputText = "";
        }

        // Used as a keydown event handler. Esc dismisses the prompt.
        // Key code 27 is ESC.
        var checkEscape = function (key) {
            var code = (key.charCode || key.keyCode);
            if (code === 27) {
                close(true);
            }
        };

        // Dismisses the hyperlink input box.
        // isCancel is true if we don't care about the input text.
        // isCancel is false if we are going to keep the text.
        var close = function (isCancel) {
            util.removeEvent(doc.body, "keydown", checkEscape);
            var text = input.value;

            if (isCancel) {
                text = null;
            }
            else {
                // Fixes common pasting errors.
                text = text.replace(/^http:\/\/(https?|ftp):\/\//, '$1://');
                if (!/^(?:https?|ftp):\/\//.test(text))
                    text = 'http://' + text;
            }

            dialog.parentNode.removeChild(dialog);

            callback(text);
            return false;
        };



        // Create the text input box form/window.
        var createDialog = function () {

            // The main dialog box.
            dialog = doc.createElement("div");
            dialog.className = "wmd-prompt-dialog";
            dialog.style.padding = "10px;";
            dialog.style.position = "fixed";
            dialog.style.width = "400px";
            dialog.style.zIndex = "1001";

            // The dialog text.
            var question = doc.createElement("div");
            question.innerHTML = text;
            question.style.padding = "5px";
            dialog.appendChild(question);

            // The web form container for the text box and buttons.
            var form = doc.createElement("form"),
                style = form.style;
            form.onsubmit = function () { return close(false); };
            style.padding = "0";
            style.margin = "0";
            style.cssFloat = "left";
            style.width = "100%";
            style.textAlign = "center";
            style.position = "relative";
            dialog.appendChild(form);

            // The input text box
            input = doc.createElement("input");
            input.type = "text";
            input.value = defaultInputText;
            style = input.style;
            style.display = "block";
            style.width = "80%";
            style.marginLeft = style.marginRight = "auto";
            form.appendChild(input);

            // The ok button
            var okButton = doc.createElement("input");
            okButton.type = "button";
            okButton.onclick = function () { return close(false); };
            okButton.value = "OK";
            style = okButton.style;
            style.margin = "10px";
            style.display = "inline";
            style.width = "7em";


            // The cancel button
            var cancelButton = doc.createElement("input");
            cancelButton.type = "button";
            cancelButton.onclick = function () { return close(true); };
            cancelButton.value = "Cancel";
            style = cancelButton.style;
            style.margin = "10px";
            style.display = "inline";
            style.width = "7em";

            form.appendChild(okButton);
            form.appendChild(cancelButton);

            util.addEvent(doc.body, "keydown", checkEscape);
            dialog.style.top = "50%";
            dialog.style.left = "50%";
            dialog.style.display = "block";
            doc.body.appendChild(dialog);

            // This has to be done AFTER adding the dialog to the form if you
            // want it to be centered.
            dialog.style.marginTop = -(position.getHeight(dialog) / 2) + "px";
            dialog.style.marginLeft = -(position.getWidth(dialog) / 2) + "px";

        };

        // Why is this in a zero-length timeout?
        // Is it working around a browser bug?
        setTimeout(function () {

            createDialog();

            var defTextLen = defaultInputText.length;
            if (input.selectionStart !== undefined) {
                input.selectionStart = 0;
                input.selectionEnd = defTextLen;
            }
            else if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(false);
                range.moveStart("character", -defTextLen);
                range.moveEnd("character", defTextLen);
                range.select();
            }

            input.focus();
        }, 0);
    };

    function UIManager(postfix, panels, undoManager, previewManager, commandManager, helpOptions, getString) {

        var inputBox = panels.input,
            buttons = {}; // buttons.undo, buttons.link, etc. The actual DOM elements.

        makeSpritedButtonRow();

        util.addEvent(inputBox, 'keydown', function (key) {

            // Check to see if we have a button key and, if so execute the callback.
            if ((key.ctrlKey || key.metaKey) && !key.altKey && !key.shiftKey) {

                var keyCode = key.charCode || key.keyCode;
                var keyCodeStr = String.fromCharCode(keyCode).toLowerCase();

                switch (keyCodeStr) {
                    case "b":
                        doClick(buttons.bold);
                        break;
                    case "i":
                        doClick(buttons.italic);
                        break;
                    case "l":
                        doClick(buttons.link);
                        break;
                    case "q":
                        doClick(buttons.quote);
                        break;
                    case "k":
                        doClick(buttons.code);
                        break;
                    case "g":
                        doClick(buttons.image);
                        break;
                    case "o":
                        doClick(buttons.olist);
                        break;
                    case "u":
                        doClick(buttons.ulist);
                        break;
                    case "h":
                        doClick(buttons.heading);
                        break;
                    case "r":
                        doClick(buttons.hr);
                        break;
                    case "y":
                        doClick(buttons.redo);
                        break;
                    case "z":
                        if (key.shiftKey) {
                            doClick(buttons.redo);
                        }
                        else {
                            doClick(buttons.undo);
                        }
                        break;
                    default:
                        return;
                }


                if (key.preventDefault) {
                    key.preventDefault();
                }

                if (window.event) {
                    window.event.returnValue = false;
                }
            }
        });

        // Auto-indent on shift-enter
        util.addEvent(inputBox, "keyup", function (key) {
            if (key.shiftKey && !key.ctrlKey && !key.metaKey) {
                var keyCode = key.charCode || key.keyCode;
                // Character 13 is Enter
                if (keyCode === 13) {
                    var fakeButton = {};
                    fakeButton.textOp = bindCommand("doAutoindent");
                    doClick(fakeButton);
                }
            }
        });

        // special handler because IE clears the context of the textbox on ESC
        if (isIE) {
            util.addEvent(inputBox, "keydown", function (key) {
                var code = key.keyCode;
                if (code === 27) {
                    return false;
                }
            });
        }


        // Perform the button's action.
        function doClick(button) {

            inputBox.focus();

            if (button.textOp) {

                if (undoManager) {
                    undoManager.setCommandMode();
                }

                var state = new TextareaState(panels);

                if (!state) {
                    return;
                }

                var chunks = state.getChunks();

                var fixupInputArea = function () {

                    inputBox.focus();

                    if (chunks) {
                        state.setChunks(chunks);
                    }

                    state.restore();
                    previewManager.refresh();
                };

                var noCleanup = button.textOp(chunks, fixupInputArea);

                if (!noCleanup) {
                    fixupInputArea();
                }

            }

            if (button.execute) {
                button.execute(undoManager);
            }
        };

        function setupButton(button, isEnabled) {

            var normalYShift = "0px";
            var disabledYShift = "-20px";
            var highlightYShift = "-40px";
            var image = button.getElementsByTagName("span")[0];
            if (isEnabled) {
                image.style.backgroundPosition = button.XShift + " " + normalYShift;
                button.onmouseover = function () {
                    image.style.backgroundPosition = this.XShift + " " + highlightYShift;
                };

                button.onmouseout = function () {
                    image.style.backgroundPosition = this.XShift + " " + normalYShift;
                };

                // IE tries to select the background image "button" text (it's
                // implemented in a list item) so we have to cache the selection
                // on mousedown.
                if (isIE) {
                    button.onmousedown = function () {
                        if (doc.activeElement && doc.activeElement !== panels.input) { // we're not even in the input box, so there's no selection
                            return;
                        }
                        panels.ieCachedRange = document.selection.createRange();
                        panels.ieCachedScrollTop = panels.input.scrollTop;
                    };
                }

                if (!button.isHelp) {
                    button.onclick = function () {
                        if (this.onmouseout) {
                            this.onmouseout();
                        }
                        doClick(this);
                        return false;
                    }
                }
            }
            else {
                image.style.backgroundPosition = button.XShift + " " + disabledYShift;
                button.onmouseover = button.onmouseout = button.onclick = function () { };
            }
        }

        function bindCommand(method) {
            if (typeof method === "string")
                method = commandManager[method];
            return function () { method.apply(commandManager, arguments); }
        }

        function makeSpritedButtonRow() {

            var buttonBar = panels.buttonBar;

            var buttonRow = document.createElement("ul");
            buttonRow.id = "wmd-button-row" + postfix;
            buttonRow.className = 'wmd-button-row';
            buttonRow = buttonBar.appendChild(buttonRow);
            var xPosition = 0;
            var makeButton = function (id, title, XShift, textOp) {
                var button = document.createElement("li");
                button.className = "wmd-button";
                button.style.left = xPosition + "px";
                xPosition += 25;
                var buttonImage = document.createElement("span");
                button.id = id + postfix;
                button.appendChild(buttonImage);
                button.title = title;
                button.XShift = XShift;
                if (textOp)
                    button.textOp = textOp;
                setupButton(button, true);
                buttonRow.appendChild(button);
                return button;
            };
            var makeSpacer = function (num) {
                var spacer = document.createElement("li");
                spacer.className = "wmd-spacer wmd-spacer" + num;
                spacer.id = "wmd-spacer" + num + postfix;
                buttonRow.appendChild(spacer);
                xPosition += 25;
            }

            buttons.bold = makeButton("wmd-bold-button", getString("bold"), "0px", bindCommand("doBold"));
            buttons.italic = makeButton("wmd-italic-button", getString("italic"), "-20px", bindCommand("doItalic"));
            makeSpacer(1);
            buttons.link = makeButton("wmd-link-button", getString("link"), "-40px", bindCommand(function (chunk, postProcessing) {
                return this.doLinkOrImage(chunk, postProcessing, false);
            }));
            buttons.quote = makeButton("wmd-quote-button", getString("quote"), "-60px", bindCommand("doBlockquote"));
            buttons.code = makeButton("wmd-code-button", getString("code"), "-80px", bindCommand("doCode"));
            buttons.image = makeButton("wmd-image-button", getString("image"), "-100px", bindCommand(function (chunk, postProcessing) {
                return this.doLinkOrImage(chunk, postProcessing, true);
            }));
            makeSpacer(2);
            buttons.olist = makeButton("wmd-olist-button", getString("olist"), "-120px", bindCommand(function (chunk, postProcessing) {
                this.doList(chunk, postProcessing, true);
            }));
            buttons.ulist = makeButton("wmd-ulist-button", getString("ulist"), "-140px", bindCommand(function (chunk, postProcessing) {
                this.doList(chunk, postProcessing, false);
            }));
            buttons.heading = makeButton("wmd-heading-button", getString("heading"), "-160px", bindCommand("doHeading"));
            buttons.hr = makeButton("wmd-hr-button", getString("hr"), "-180px", bindCommand("doHorizontalRule"));
            makeSpacer(3);
            buttons.undo = makeButton("wmd-undo-button", getString("undo"), "-200px", null);
            buttons.undo.execute = function (manager) { if (manager) manager.undo(); };

            var redoTitle = /win/.test(nav.platform.toLowerCase()) ?
                getString("redo") :
                getString("redomac"); // mac and other non-Windows platforms

            buttons.redo = makeButton("wmd-redo-button", redoTitle, "-220px", null);
            buttons.redo.execute = function (manager) { if (manager) manager.redo(); };

            if (helpOptions) {
                var helpButton = document.createElement("li");
                var helpButtonImage = document.createElement("span");
                helpButton.appendChild(helpButtonImage);
                helpButton.className = "wmd-button wmd-help-button";
                helpButton.id = "wmd-help-button" + postfix;
                helpButton.XShift = "-240px";
                helpButton.isHelp = true;
                helpButton.style.right = "0px";
                helpButton.title = getString("help");
                helpButton.onclick = helpOptions.handler;

                setupButton(helpButton, true);
                buttonRow.appendChild(helpButton);
                buttons.help = helpButton;
            }

            setUndoRedoButtonStates();
        }

        function setUndoRedoButtonStates() {
            if (undoManager) {
                setupButton(buttons.undo, undoManager.canUndo());
                setupButton(buttons.redo, undoManager.canRedo());
            }
        };

        this.setUndoRedoButtonStates = setUndoRedoButtonStates;

    }

    function CommandManager(pluginHooks, getString) {
        this.hooks = pluginHooks;
        this.getString = getString;
    }

    var commandProto = CommandManager.prototype;

    // The markdown symbols - 4 spaces = code, > = blockquote, etc.
    commandProto.prefixes = "(?:\\s{4,}|\\s*>|\\s*-\\s+|\\s*\\d+\\.|=|\\+|-|_|\\*|#|\\s*\\[[^\n]]+\\]:)";

    // Remove markdown symbols from the chunk selection.
    commandProto.unwrap = function (chunk) {
        var txt = new re("([^\\n])\\n(?!(\\n|" + this.prefixes + "))", "g");
        chunk.selection = chunk.selection.replace(txt, "$1 $2");
    };

    commandProto.wrap = function (chunk, len) {
        this.unwrap(chunk);
        var regex = new re("(.{1," + len + "})( +|$\\n?)", "gm"),
            that = this;

        chunk.selection = chunk.selection.replace(regex, function (line, marked) {
            if (new re("^" + that.prefixes, "").test(line)) {
                return line;
            }
            return marked + "\n";
        });

        chunk.selection = chunk.selection.replace(/\s+$/, "");
    };

    commandProto.doBold = function (chunk, postProcessing) {
        return this.doBorI(chunk, postProcessing, 2, this.getString("boldexample"));
    };

    commandProto.doItalic = function (chunk, postProcessing) {
        return this.doBorI(chunk, postProcessing, 1, this.getString("italicexample"));
    };

    // chunk: The selected region that will be enclosed with */**
    // nStars: 1 for italics, 2 for bold
    // insertText: If you just click the button without highlighting text, this gets inserted
    commandProto.doBorI = function (chunk, postProcessing, nStars, insertText) {

        // Get rid of whitespace and fixup newlines.
        chunk.trimWhitespace();
        chunk.selection = chunk.selection.replace(/\n{2,}/g, "\n");

        // Look for stars before and after.  Is the chunk already marked up?
        // note that these regex matches cannot fail
        var starsBefore = /(\**$)/.exec(chunk.before)[0];
        var starsAfter = /(^\**)/.exec(chunk.after)[0];

        var prevStars = Math.min(starsBefore.length, starsAfter.length);

        // Remove stars if we have to since the button acts as a toggle.
        if ((prevStars >= nStars) && (prevStars != 2 || nStars != 1)) {
            chunk.before = chunk.before.replace(re("[*]{" + nStars + "}$", ""), "");
            chunk.after = chunk.after.replace(re("^[*]{" + nStars + "}", ""), "");
        }
        else if (!chunk.selection && starsAfter) {
            // It's not really clear why this code is necessary.  It just moves
            // some arbitrary stuff around.
            chunk.after = chunk.after.replace(/^([*_]*)/, "");
            chunk.before = chunk.before.replace(/(\s?)$/, "");
            var whitespace = re.$1;
            chunk.before = chunk.before + starsAfter + whitespace;
        }
        else {

            // In most cases, if you don't have any selected text and click the button
            // you'll get a selected, marked up region with the default text inserted.
            if (!chunk.selection && !starsAfter) {
                chunk.selection = insertText;
            }

            // Add the true markup.
            var markup = nStars <= 1 ? "*" : "**"; // shouldn't the test be = ?
            chunk.before = chunk.before + markup;
            chunk.after = markup + chunk.after;
        }

        return;
    };

    commandProto.stripLinkDefs = function (text, defsToAdd) {

        text = text.replace(/^[ ]{0,3}\[(\d+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|$)/gm,
            function (totalMatch, id, link, newlines, title) {
                defsToAdd[id] = totalMatch.replace(/\s*$/, "");
                if (newlines) {
                    // Strip the title and return that separately.
                    defsToAdd[id] = totalMatch.replace(/["(](.+?)[")]$/, "");
                    return newlines + title;
                }
                return "";
            });

        return text;
    };

    commandProto.addLinkDef = function (chunk, linkDef) {

        var refNumber = 0; // The current reference number
        var defsToAdd = {}; //
        // Start with a clean slate by removing all previous link definitions.
        chunk.before = this.stripLinkDefs(chunk.before, defsToAdd);
        chunk.selection = this.stripLinkDefs(chunk.selection, defsToAdd);
        chunk.after = this.stripLinkDefs(chunk.after, defsToAdd);

        var defs = "";
        var regex = /(\[)((?:\[[^\]]*\]|[^\[\]])*)(\][ ]?(?:\n[ ]*)?\[)(\d+)(\])/g;

        var addDefNumber = function (def) {
            refNumber++;
            def = def.replace(/^[ ]{0,3}\[(\d+)\]:/, "  [" + refNumber + "]:");
            defs += "\n" + def;
        };

        // note that
        // a) the recursive call to getLink cannot go infinite, because by definition
        //    of regex, inner is always a proper substring of wholeMatch, and
        // b) more than one level of nesting is neither supported by the regex
        //    nor making a lot of sense (the only use case for nesting is a linked image)
        var getLink = function (wholeMatch, before, inner, afterInner, id, end) {
            inner = inner.replace(regex, getLink);
            if (defsToAdd[id]) {
                addDefNumber(defsToAdd[id]);
                return before + inner + afterInner + refNumber + end;
            }
            return wholeMatch;
        };

        chunk.before = chunk.before.replace(regex, getLink);

        if (linkDef) {
            addDefNumber(linkDef);
        }
        else {
            chunk.selection = chunk.selection.replace(regex, getLink);
        }

        var refOut = refNumber;

        chunk.after = chunk.after.replace(regex, getLink);

        if (chunk.after) {
            chunk.after = chunk.after.replace(/\n*$/, "");
        }
        if (!chunk.after) {
            chunk.selection = chunk.selection.replace(/\n*$/, "");
        }

        chunk.after += "\n\n" + defs;

        return refOut;
    };

    // takes the line as entered into the add link/as image dialog and makes
    // sure the URL and the optinal title are "nice".
    function properlyEncoded(linkdef) {
        return linkdef.replace(/^\s*(.*?)(?:\s+"(.+)")?\s*$/, function (wholematch, link, title) {
            link = link.replace(/\?.*$/, function (querypart) {
                return querypart.replace(/\+/g, " "); // in the query string, a plus and a space are identical
            });
            link = decodeURIComponent(link); // unencode first, to prevent double encoding
            link = encodeURI(link).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
            link = link.replace(/\?.*$/, function (querypart) {
                return querypart.replace(/\+/g, "%2b"); // since we replaced plus with spaces in the query part, all pluses that now appear where originally encoded
            });
            if (title) {
                title = title.trim ? title.trim() : title.replace(/^\s*/, "").replace(/\s*$/, "");
                title = title.replace(/"/g, "quot;").replace(/\(/g, "&#40;").replace(/\)/g, "&#41;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
            return title ? link + ' "' + title + '"' : link;
        });
    }

    commandProto.doLinkOrImage = function (chunk, postProcessing, isImage) {

        chunk.trimWhitespace();
        chunk.findTags(/\s*!?\[/, /\][ ]?(?:\n[ ]*)?(\[.*?\])?/);
        var background;

        if (chunk.endTag.length > 1 && chunk.startTag.length > 0) {

            chunk.startTag = chunk.startTag.replace(/!?\[/, "");
            chunk.endTag = "";
            this.addLinkDef(chunk, null);

        }
        else {
            
            // We're moving start and end tag back into the selection, since (as we're in the else block) we're not
            // *removing* a link, but *adding* one, so whatever findTags() found is now back to being part of the
            // link text. linkEnteredCallback takes care of escaping any brackets.
            chunk.selection = chunk.startTag + chunk.selection + chunk.endTag;
            chunk.startTag = chunk.endTag = "";

            if (/\n\n/.test(chunk.selection)) {
                this.addLinkDef(chunk, null);
                return;
            }
            var that = this;
            // The function to be executed when you enter a link and press OK or Cancel.
            // Marks up the link and adds the ref.
            var linkEnteredCallback = function (link) {

                background.parentNode.removeChild(background);

                if (link !== null) {
                    // (                          $1
                    //     [^\\]                  anything that's not a backslash
                    //     (?:\\\\)*              an even number (this includes zero) of backslashes
                    // )
                    // (?=                        followed by
                    //     [[\]]                  an opening or closing bracket
                    // )
                    //
                    // In other words, a non-escaped bracket. These have to be escaped now to make sure they
                    // don't count as the end of the link or similar.
                    // Note that the actual bracket has to be a lookahead, because (in case of to subsequent brackets),
                    // the bracket in one match may be the "not a backslash" character in the next match, so it
                    // should not be consumed by the first match.
                    // The "prepend a space and finally remove it" steps makes sure there is a "not a backslash" at the
                    // start of the string, so this also works if the selection begins with a bracket. We cannot solve
                    // this by anchoring with ^, because in the case that the selection starts with two brackets, this
                    // would mean a zero-width match at the start. Since zero-width matches advance the string position,
                    // the first bracket could then not act as the "not a backslash" for the second.
                    chunk.selection = (" " + chunk.selection).replace(/([^\\](?:\\\\)*)(?=[[\]])/g, "$1\\").substr(1);
                    
                    var linkDef = " [999]: " + properlyEncoded(link);

                    var num = that.addLinkDef(chunk, linkDef);
                    chunk.startTag = isImage ? "![" : "[";
                    chunk.endTag = "][" + num + "]";

                    if (!chunk.selection) {
                        if (isImage) {
                            chunk.selection = that.getString("imagedescription");
                        }
                        else {
                            chunk.selection = that.getString("linkdescription");
                        }
                    }
                }
                postProcessing();
            };

            background = ui.createBackground();

            if (isImage) {
                if (!this.hooks.insertImageDialog(linkEnteredCallback))
                    ui.prompt(this.getString("imagedialog"), imageDefaultText, linkEnteredCallback);
            }
            else {
                ui.prompt(this.getString("linkdialog"), linkDefaultText, linkEnteredCallback);
            }
            return true;
        }
    };

    // When making a list, hitting shift-enter will put your cursor on the next line
    // at the current indent level.
    commandProto.doAutoindent = function (chunk) {

        var commandMgr = this,
            fakeSelection = false;

        chunk.before = chunk.before.replace(/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]*\n$/, "\n\n");
        chunk.before = chunk.before.replace(/(\n|^)[ ]{0,3}>[ \t]*\n$/, "\n\n");
        chunk.before = chunk.before.replace(/(\n|^)[ \t]+\n$/, "\n\n");
        
        // There's no selection, end the cursor wasn't at the end of the line:
        // The user wants to split the current list item / code line / blockquote line
        // (for the latter it doesn't really matter) in two. Temporarily select the
        // (rest of the) line to achieve this.
        if (!chunk.selection && !/^[ \t]*(?:\n|$)/.test(chunk.after)) {
            chunk.after = chunk.after.replace(/^[^\n]*/, function (wholeMatch) {
                chunk.selection = wholeMatch;
                return "";
            });
            fakeSelection = true;
        }

        if (/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]+.*\n$/.test(chunk.before)) {
            if (commandMgr.doList) {
                commandMgr.doList(chunk);
            }
        }
        if (/(\n|^)[ ]{0,3}>[ \t]+.*\n$/.test(chunk.before)) {
            if (commandMgr.doBlockquote) {
                commandMgr.doBlockquote(chunk);
            }
        }
        if (/(\n|^)(\t|[ ]{4,}).*\n$/.test(chunk.before)) {
            if (commandMgr.doCode) {
                commandMgr.doCode(chunk);
            }
        }
        
        if (fakeSelection) {
            chunk.after = chunk.selection + chunk.after;
            chunk.selection = "";
        }
    };

    commandProto.doBlockquote = function (chunk) {

        chunk.selection = chunk.selection.replace(/^(\n*)([^\r]+?)(\n*)$/,
            function (totalMatch, newlinesBefore, text, newlinesAfter) {
                chunk.before += newlinesBefore;
                chunk.after = newlinesAfter + chunk.after;
                return text;
            });

        chunk.before = chunk.before.replace(/(>[ \t]*)$/,
            function (totalMatch, blankLine) {
                chunk.selection = blankLine + chunk.selection;
                return "";
            });

        chunk.selection = chunk.selection.replace(/^(\s|>)+$/, "");
        chunk.selection = chunk.selection || this.getString("quoteexample");

        // The original code uses a regular expression to find out how much of the
        // text *directly before* the selection already was a blockquote:

        /*
        if (chunk.before) {
        chunk.before = chunk.before.replace(/\n?$/, "\n");
        }
        chunk.before = chunk.before.replace(/(((\n|^)(\n[ \t]*)*>(.+\n)*.*)+(\n[ \t]*)*$)/,
        function (totalMatch) {
        chunk.startTag = totalMatch;
        return "";
        });
        */

        // This comes down to:
        // Go backwards as many lines a possible, such that each line
        //  a) starts with ">", or
        //  b) is almost empty, except for whitespace, or
        //  c) is preceeded by an unbroken chain of non-empty lines
        //     leading up to a line that starts with ">" and at least one more character
        // and in addition
        //  d) at least one line fulfills a)
        //
        // Since this is essentially a backwards-moving regex, it's susceptible to
        // catstrophic backtracking and can cause the browser to hang;
        // see e.g. http://meta.stackoverflow.com/questions/9807.
        //
        // Hence we replaced this by a simple state machine that just goes through the
        // lines and checks for a), b), and c).

        var match = "",
            leftOver = "",
            line;
        if (chunk.before) {
            var lines = chunk.before.replace(/\n$/, "").split("\n");
            var inChain = false;
            for (var i = 0; i < lines.length; i++) {
                var good = false;
                line = lines[i];
                inChain = inChain && line.length > 0; // c) any non-empty line continues the chain
                if (/^>/.test(line)) {                // a)
                    good = true;
                    if (!inChain && line.length > 1)  // c) any line that starts with ">" and has at least one more character starts the chain
                        inChain = true;
                } else if (/^[ \t]*$/.test(line)) {   // b)
                    good = true;
                } else {
                    good = inChain;                   // c) the line is not empty and does not start with ">", so it matches if and only if we're in the chain
                }
                if (good) {
                    match += line + "\n";
                } else {
                    leftOver += match + line;
                    match = "\n";
                }
            }
            if (!/(^|\n)>/.test(match)) {             // d)
                leftOver += match;
                match = "";
            }
        }

        chunk.startTag = match;
        chunk.before = leftOver;

        // end of change

        if (chunk.after) {
            chunk.after = chunk.after.replace(/^\n?/, "\n");
        }

        chunk.after = chunk.after.replace(/^(((\n|^)(\n[ \t]*)*>(.+\n)*.*)+(\n[ \t]*)*)/,
            function (totalMatch) {
                chunk.endTag = totalMatch;
                return "";
            }
        );

        var replaceBlanksInTags = function (useBracket) {

            var replacement = useBracket ? "> " : "";

            if (chunk.startTag) {
                chunk.startTag = chunk.startTag.replace(/\n((>|\s)*)\n$/,
                    function (totalMatch, markdown) {
                        return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
                    });
            }
            if (chunk.endTag) {
                chunk.endTag = chunk.endTag.replace(/^\n((>|\s)*)\n/,
                    function (totalMatch, markdown) {
                        return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
                    });
            }
        };

        if (/^(?![ ]{0,3}>)/m.test(chunk.selection)) {
            this.wrap(chunk, SETTINGS.lineLength - 2);
            chunk.selection = chunk.selection.replace(/^/gm, "> ");
            replaceBlanksInTags(true);
            chunk.skipLines();
        } else {
            chunk.selection = chunk.selection.replace(/^[ ]{0,3}> ?/gm, "");
            this.unwrap(chunk);
            replaceBlanksInTags(false);

            if (!/^(\n|^)[ ]{0,3}>/.test(chunk.selection) && chunk.startTag) {
                chunk.startTag = chunk.startTag.replace(/\n{0,2}$/, "\n\n");
            }

            if (!/(\n|^)[ ]{0,3}>.*$/.test(chunk.selection) && chunk.endTag) {
                chunk.endTag = chunk.endTag.replace(/^\n{0,2}/, "\n\n");
            }
        }

        chunk.selection = this.hooks.postBlockquoteCreation(chunk.selection);

        if (!/\n/.test(chunk.selection)) {
            chunk.selection = chunk.selection.replace(/^(> *)/,
            function (wholeMatch, blanks) {
                chunk.startTag += blanks;
                return "";
            });
        }
    };

    commandProto.doCode = function (chunk) {

        var hasTextBefore = /\S[ ]*$/.test(chunk.before);
        var hasTextAfter = /^[ ]*\S/.test(chunk.after);

        // Use 'four space' markdown if the selection is on its own
        // line or is multiline.
        if ((!hasTextAfter && !hasTextBefore) || /\n/.test(chunk.selection)) {

            chunk.before = chunk.before.replace(/[ ]{4}$/,
                function (totalMatch) {
                    chunk.selection = totalMatch + chunk.selection;
                    return "";
                });

            var nLinesBack = 1;
            var nLinesForward = 1;

            if (/(\n|^)(\t|[ ]{4,}).*\n$/.test(chunk.before)) {
                nLinesBack = 0;
            }
            if (/^\n(\t|[ ]{4,})/.test(chunk.after)) {
                nLinesForward = 0;
            }

            chunk.skipLines(nLinesBack, nLinesForward);

            if (!chunk.selection) {
                chunk.startTag = "    ";
                chunk.selection = this.getString("codeexample");
            }
            else {
                if (/^[ ]{0,3}\S/m.test(chunk.selection)) {
                    if (/\n/.test(chunk.selection))
                        chunk.selection = chunk.selection.replace(/^/gm, "    ");
                    else // if it's not multiline, do not select the four added spaces; this is more consistent with the doList behavior
                        chunk.before += "    ";
                }
                else {
                    chunk.selection = chunk.selection.replace(/^[ ]{4}/gm, "");
                }
            }
        }
        else {
            // Use backticks (`) to delimit the code block.

            chunk.trimWhitespace();
            chunk.findTags(/`/, /`/);

            if (!chunk.startTag && !chunk.endTag) {
                chunk.startTag = chunk.endTag = "`";
                if (!chunk.selection) {
                    chunk.selection = this.getString("codeexample");
                }
            }
            else if (chunk.endTag && !chunk.startTag) {
                chunk.before += chunk.endTag;
                chunk.endTag = "";
            }
            else {
                chunk.startTag = chunk.endTag = "";
            }
        }
    };

    commandProto.doList = function (chunk, postProcessing, isNumberedList) {

        // These are identical except at the very beginning and end.
        // Should probably use the regex extension function to make this clearer.
        var previousItemsRegex = /(\n|^)(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*$/;
        var nextItemsRegex = /^\n*(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*/;

        // The default bullet is a dash but others are possible.
        // This has nothing to do with the particular HTML bullet,
        // it's just a markdown bullet.
        var bullet = "-";

        // The number in a numbered list.
        var num = 1;

        // Get the item prefix - e.g. " 1. " for a numbered list, " - " for a bulleted list.
        function getItemPrefix() {
            var prefix;
            if (isNumberedList) {
                prefix = " " + num + ". ";
                num++;
            }
            else {
                prefix = " " + bullet + " ";
            }
            return prefix;
        };

        // Fixes the prefixes of the other list items.
        function getPrefixedItem(itemText) {

            // The numbering flag is unset when called by autoindent.
            if (isNumberedList === undefined) {
                isNumberedList = /^\s*\d/.test(itemText);
            }

            // Renumber/bullet the list element.
            itemText = itemText.replace(/^[ ]{0,3}([*+-]|\d+[.])\s/gm, getItemPrefix);

            return itemText;
        };

        chunk.findTags(/(\n|^)*[ ]{0,3}([*+-]|\d+[.])\s+/, null);

        if (chunk.before && !/\n$/.test(chunk.before) && !/^\n/.test(chunk.startTag)) {
            chunk.before += chunk.startTag;
            chunk.startTag = "";
        }

        if (chunk.startTag) {

            var hasDigits = /\d+[.]/.test(chunk.startTag);
            chunk.startTag = "";
            chunk.selection = chunk.selection.replace(/\n[ ]{4}/g, "\n");
            this.unwrap(chunk);
            chunk.skipLines();

            if (hasDigits) {
                // Have to renumber the bullet points if this is a numbered list.
                chunk.after = chunk.after.replace(nextItemsRegex, getPrefixedItem);
            }
            if (isNumberedList == hasDigits) {
                return;
            }
        }

        var nLinesUp = 1;

        chunk.before = chunk.before.replace(previousItemsRegex,
            function (itemText) {
                if (/^\s*([*+-])/.test(itemText)) {
                    bullet = re.$1;
                }
                nLinesUp = /[^\n]\n\n[^\n]/.test(itemText) ? 1 : 0;
                return getPrefixedItem(itemText);
            });

        if (!chunk.selection) {
            chunk.selection = this.getString("litem");
        }

        var prefix = getItemPrefix();

        var nLinesDown = 1;

        chunk.after = chunk.after.replace(nextItemsRegex,
            function (itemText) {
                nLinesDown = /[^\n]\n\n[^\n]/.test(itemText) ? 1 : 0;
                return getPrefixedItem(itemText);
            });

        chunk.trimWhitespace(true);
        chunk.skipLines(nLinesUp, nLinesDown, true);
        chunk.startTag = prefix;
        var spaces = prefix.replace(/./g, " ");
        this.wrap(chunk, SETTINGS.lineLength - spaces.length);
        chunk.selection = chunk.selection.replace(/\n/g, "\n" + spaces);

    };

    commandProto.doHeading = function (chunk) {

        // Remove leading/trailing whitespace and reduce internal spaces to single spaces.
        chunk.selection = chunk.selection.replace(/\s+/g, " ");
        chunk.selection = chunk.selection.replace(/(^\s+|\s+$)/g, "");

        // If we clicked the button with no selected text, we just
        // make a level 2 hash header around some default text.
        if (!chunk.selection) {
            chunk.startTag = "## ";
            chunk.selection = this.getString("headingexample");
            chunk.endTag = " ##";
            return;
        }

        var headerLevel = 0;     // The existing header level of the selected text.

        // Remove any existing hash heading markdown and save the header level.
        chunk.findTags(/#+[ ]*/, /[ ]*#+/);
        if (/#+/.test(chunk.startTag)) {
            headerLevel = re.lastMatch.length;
        }
        chunk.startTag = chunk.endTag = "";

        // Try to get the current header level by looking for - and = in the line
        // below the selection.
        chunk.findTags(null, /\s?(-+|=+)/);
        if (/=+/.test(chunk.endTag)) {
            headerLevel = 1;
        }
        if (/-+/.test(chunk.endTag)) {
            headerLevel = 2;
        }

        // Skip to the next line so we can create the header markdown.
        chunk.startTag = chunk.endTag = "";
        chunk.skipLines(1, 1);

        // We make a level 2 header if there is no current header.
        // If there is a header level, we substract one from the header level.
        // If it's already a level 1 header, it's removed.
        var headerLevelToCreate = headerLevel == 0 ? 2 : headerLevel - 1;

        if (headerLevelToCreate > 0) {

            // The button only creates level 1 and 2 underline headers.
            // Why not have it iterate over hash header levels?  Wouldn't that be easier and cleaner?
            var headerChar = headerLevelToCreate >= 2 ? "-" : "=";
            var len = chunk.selection.length;
            if (len > SETTINGS.lineLength) {
                len = SETTINGS.lineLength;
            }
            chunk.endTag = "\n";
            while (len--) {
                chunk.endTag += headerChar;
            }
        }
    };

    commandProto.doHorizontalRule = function (chunk) {
        chunk.startTag = "----------\n";
        chunk.selection = "";
        chunk.skipLines(2, 1, true);
    }
})();


module.exports = Markdown;
});
require.register("rooms/libraries/path.js", function(module, exports, require){
var Path = { version: "0.8", map: function (a) { if (Path.routes.defined.hasOwnProperty(a)) { return Path.routes.defined[a] } else { return new Path.core.route(a) } }, root: function (a) { Path.routes.root = a }, rescue: function (a) { Path.routes.rescue = a }, history: { pushState: function (a, c, b) { if (Path.history.supported) { if (Path.dispatch(b)) { history.pushState(a, c, b) } } else { if (Path.history.fallback) { window.location.hash = "#" + b } } }, popState: function (a) { Path.dispatch(document.location.pathname) }, listen: function (a) { Path.history.supported = !!(window.history && window.history.pushState); Path.history.fallback = a; if (Path.history.supported) { window.onpopstate = Path.history.popState } else { if (Path.history.fallback) { for (route in Path.routes.defined) { if (route.charAt(0) != "#") { Path.routes.defined["#" + route] = Path.routes.defined[route]; Path.routes.defined["#" + route].path = "#" + route } } Path.listen() } } } }, match: function (k, h) { var b = {}, g = null, e, f, d, c, a; for (g in Path.routes.defined) { if (g !== null && g !== undefined) { g = Path.routes.defined[g]; e = g.partition(); for (c = 0; c < e.length; c++) { f = e[c]; a = k; if (f.search(/:/) > 0) { for (d = 0; d < f.split("/").length; d++) { if ((d < a.split("/").length) && (f.split("/")[d].charAt(0) === ":")) { b[f.split("/")[d].replace(/:/, "")] = a.split("/")[d]; a = a.replace(a.split("/")[d], f.split("/")[d]) } } } if (f === a) { if (h) { g.params = b } return g } } } } return null }, dispatch: function (a) { var b, c; if (Path.routes.current !== a) { Path.routes.previous = Path.routes.current; Path.routes.current = a; c = Path.match(a, true); if (Path.routes.previous) { b = Path.match(Path.routes.previous); if (b !== null && b.do_exit !== null) { b.do_exit() } } if (c !== null) { c.run(); return true } else { if (Path.routes.rescue !== null) { Path.routes.rescue() } } } }, listen: function () { var a = function () { Path.dispatch(location.hash) }; if (location.hash === "") { if (Path.routes.root !== null) { location.hash = Path.routes.root } } else { Path.dispatch(location.hash) } if ("onhashchange" in window) { window.onhashchange = a } else { setInterval(a, 50) } }, core: { route: function (a) { this.path = a; this.action = null; this.do_enter = []; this.do_exit = null; this.params = {}; Path.routes.defined[a] = this } }, routes: { current: null, root: null, rescue: null, previous: null, defined: {}} }; Path.core.route.prototype = { to: function (a) { this.action = a; return this }, enter: function (a) { if (a instanceof Array) { this.do_enter = this.do_enter.concat(a) } else { this.do_enter.push(a) } return this }, exit: function (a) { this.do_exit = a; return this }, partition: function () { var d = [], a = [], c = /\(([^}]+?)\)/g, e, b; while (e = c.exec(this.path)) { d.push(e[1]) } a.push(this.path.split("(")[0]); for (b = 0; b < d.length; b++) { a.push(a[a.length - 1] + d[b]) } return a }, run: function () { var b = false, c, a, d; if (Path.routes.defined[this.path].hasOwnProperty("do_enter")) { if (Path.routes.defined[this.path].do_enter.length > 0) { for (c = 0; c < Path.routes.defined[this.path].do_enter.length; c++) { a = Path.routes.defined[this.path].do_enter[c](); if (a === false) { b = true; break } } } } if (!b) { Path.routes.defined[this.path].action() } } };


Path.refresh = function () {
    Path.routes.current = null;
    Path.dispatch(location.hash);
};

module.exports = Path;
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
require.register("rooms/server.js", function(module, exports, require){
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
module.exports = {
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
});
require.register("rooms/stream.js", function(module, exports, require){
var server = require('./server');
var Emitter = require('emitter');
module.exports = (function () {


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
                    url: server.prefix + 'data/stream',
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
                subscriptions = subscriptions.filter(function (s) { return s != subscription; });
            };
        };
    } ());

    var state = {};
    subscribeRaw(function (data) {
        emitter.emit('raw', data);
    });

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
});
require.alias("ForbesLindesay-curry/index.js", "rooms/deps/curry/index.js");

require.alias("ForbesLindesay-queue/index.js", "rooms/deps/queue/index.js");

require.alias("ForbesLindesay-to-bool-function/index.js", "rooms/deps/to-bool-function/index.js");
require.alias("component-to-function/index.js", "ForbesLindesay-to-bool-function/deps/to-function/index.js");

require.alias("component-type/index.js", "ForbesLindesay-to-bool-function/deps/type/index.js");

require.alias("ForbesLindesay-base64-encode/index.js", "rooms/deps/base64-encode/index.js");
require.alias("ForbesLindesay-utf8-encode/index.js", "ForbesLindesay-base64-encode/deps/utf8-encode/index.js");

require.alias("ForbesLindesay-imgur/index.js", "rooms/deps/imgur/index.js");
require.alias("ForbesLindesay-promises-a/index.js", "ForbesLindesay-imgur/deps/promises-a/index.js");

require.alias("component-emitter/index.js", "ForbesLindesay-imgur/deps/emitter/index.js");

require.alias("component-find/index.js", "rooms/deps/find/index.js");
require.alias("component-to-function/index.js", "component-find/deps/to-function/index.js");

require.alias("component-group-by/index.js", "rooms/deps/group-by/index.js");
require.alias("component-to-function/index.js", "component-group-by/deps/to-function/index.js");

require.alias("component-emitter/index.js", "rooms/deps/emitter/index.js");
window.rooms = require("rooms");
})();