var app = require('../');
var find = require('find');
var loginURI = require('../helpers/status-display').uri;
var template = require('../template');
var navigationItemOrder = require('../helpers/navigation-item-order');
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
        exports.enter();
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