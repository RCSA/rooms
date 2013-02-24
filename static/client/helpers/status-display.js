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
  return '/raven/login/' + encodeURIComponent(location.hash);
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