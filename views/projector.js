var app = require('../app');
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