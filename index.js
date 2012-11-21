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

function run() {
    var isReady = false;
    (function (ready) {
        server.navigation.read(function (data) {
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