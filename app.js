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

module.exports = (function ($) {
    "use strict";
    var that = {
        SelectedStaircaseID: "",
        SelectedRoomID: "",
        Navigation: [],
        RentBands: [],
        authorization: false
    };

    //Allocations
    $(function () {
        var currentAllocations = false;
        function tryRefreshAllocationsDisplay() {
            if (currentAllocations) {
                refreshAllocationsDisplay(currentAllocations);
            }
            return module.exports;
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
        that.refreshAllocationsDisplay = tryRefreshAllocationsDisplay;
    });
    //Authentication
    $(function () {
        var currentAuth = false;
        var currentItem;
        function tryCheckAuth(item) {
            currentItem = item;
            if (that.authorization) {
                checkAuth(that.authorization, true);
            }
            return module.exports;
        }
        function checkAuth(auth, skipNavigationReload) {
            that.authorization = auth;
            if (skipNavigationReload !== true) {
                that.reloadNavigation();
            }
            if (auth.isAuthenticated) {
                $("#login").hide();
            } else {
                $("#login").show();
            }
            if (currentItem) {
                if (auth.markdownEdit && ((currentItem.isRoom && currentItem.isRoom()) ||
                    (currentItem.isStaircase && currentItem.isStaircase()) ||
                    module.exports.authorization.markdownSpecialEdit)) {
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
        that.checkAuth = tryCheckAuth;
    });

    that.reloadNavigation = function (SelectedStaircaseID, SelectedRoomID) {
        /// <summary>Updates the display of navigation menues to include what's currently selected</summary>
        if (arguments.length > 0) {
            that.SelectedStaircaseID = SelectedStaircaseID;
            that.SelectedRoomID = SelectedRoomID;
        }

        function permission(item) {
            //Display projector link because it can be used to log in.
            if (item.id === "navigationTableEdit") {
                return that.authorization && that.authorization.navigationEdit;
            } else if (item.id === "allocationEdit") {
                return that.authorization && that.authorization.allocationsEdit;
            } else {
                return true;
            }
        }
        var nav = that.Navigation.filter(permission);

        //Load Staircases
        var Staircases = nav.filter(c.parentIs("Root"));
        $("#staircases").html(template("NavigationList", { Links: Staircases }));

        //Load Rooms
        var Rooms = nav.filter(c.parentIs(that.SelectedStaircaseID));
        $("#rooms").html(template("NavigationList", { Links: Rooms }));
    }

    function mapPaths() {
        //path, itemID, parentIDs, edit
        function map(path, spec) {
            var exit = spec.exit || function () { };
            Path.map(path).to(function () {
                var item = find(that.Navigation, c.idIs(this.params[spec.id] || spec.id)) || spec.item;
                var parentid = this.params[spec.parentIDs] || spec.parentIDs;
                if (!parentid || (item.parentid === parentid) || (spec.parentIDs.some && spec.parentIDs.some(c.equals(item.parentid)))) {
                    navigateToItem(item, spec.edit, spec.enter);
                }
            }).exit(exit);
        }
        function navigateToItem(item, edit, enter) {
            if (item) {
                if (module.exports.checkAuth(item) !== false) {
                    if (item.parentid === "Root") {
                        that.reloadNavigation(item.id);
                    } else {
                        that.reloadNavigation(item.parentid, item.id);
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
                that.Navigation = data.map(model.navigationItem).sort(navigationItemOrder);
                $(ready);
            })
        }(function () {
            $("body").removeClass("loading").addClass("background");
            $("#page").fadeIn();
            Path.listen();
            isReady = true;
            $("#isThisYears").click(that.refreshAllocationsDisplay);
        }));
    }

    Path.root("#/");
    mapPaths();
    run();


    return that;
}(jQuery));