var app = require('../');
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