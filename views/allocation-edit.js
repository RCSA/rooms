var app = require('../app');
var setStatus = require('../helpers/status-display').setStatus;
var curry = require('curry');
var find = require('find');
var template = require('../template');

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
    view.markdown.loadMarkdown(item, true);
    $("#templated").html();
    stream.getAllocations(function (allocationsData) {
        var allocations = allocationsData.defaultAllocations();
        var year = allocations.year;
        var mappedStaircases = app.Navigation.filter(c.typeIs("room")).filter(c.not(c.isPermanentlyUnavailable))
            .groupBy(c.sameStaircase).map(selectStaircaseGroup(allocations)).sort(o.navigationItemComparer);
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