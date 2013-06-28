var app = require('../');
var setStatus = require('../helpers/status-display').setStatus;
var template = require('../template');
var navigationItemOrder = require('../helpers/navigation-item-order');
var loadMarkdown = require('../markdown/load-markdown');
var groupBy = require('group-by');
var server = require('../server');
var stream = require('../stream');
var condition = require('to-bool-function');

function selectRoomAllocation(allocations) {
    return function (room) {
        var allocation = allocations[room.id];
        return {
            id: room.id,
            name: room.nameSingleLine(),
            allocation: allocation || ""
        };
    };
}
function selectStaircaseGroups(allocations, staircaseGroups) {
    return Object.keys(staircaseGroups)
        .map(function (staircaseID) {
            var staircase = Object.create(app.Navigation.filter(condition('id', staircaseID))[0]);
            staircase.rooms = staircaseGroups[staircaseID].map(selectRoomAllocation(allocations));
            return staircase;
        });
}

var isInAllocationEdit = false;
$("#isThisYears").click(function () {
    if (isInAllocationEdit) {
        enter();
    }
});

exports.enter = enter;
function enter(item) {
    isInAllocationEdit = true;
    if (item) loadMarkdown(item, true);
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

exports.exit = exit;
function exit() {
    isInAllocationEdit = false;
};