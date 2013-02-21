var app = require('./');

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