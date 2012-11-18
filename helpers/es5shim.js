//Ensure Object.create is defined for older versions of Firefox
if (typeof Object.create != 'function') {
    (function () {
        var F = function () { };
        Object.create = function (o) {
            if (arguments.length > 1) { throw Error('Second argument not supported'); }
            if (o === null) { throw Error('Cannot set a null [[Prototype]]'); }
            if (typeof o != 'object') { throw TypeError('Argument must be an object'); }
            F.prototype = o;
            return new F;
        };
    })();
}
//Ensure errors cause referesh, to get out of invalid states.
window.onerror = function (em, url, ln) {
    if (location.href.indexOf("drupal-test-site") === -1 && url && url.indexOf(location.host) != -1) {
        if (confirm("An error was encountered, refresh the page to fix it?")) {
            location.reload(false);
            return false;
        }
    } else {
        //alert(em);
    }
};