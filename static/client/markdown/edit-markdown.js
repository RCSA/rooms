var app = require('../');
var converter = require('./converter');
var Markdown = require('../libraries/pagedown.js');
var template = require('../template');
var server = require('../server');

var imgur = require('imsave');
var imgurAPIKey = "e0b484465d77858ebaf6b3c7c1732909";
var upload = imgur(imgurAPIKey);

function createDialogs() {
    $(".dialog").dialog({
        autoOpen: false
    });
    function showBusy() {
        $("#busy").dialog({
            autoOpen: true,
            closeOnEscape: false,
            draggable: false,
            resizable: false,
            modal: true,
            height: 80,
            width: 180
        });
    }
    function hideBusy() {
        $("#busy").dialog("close");
    }
    function showDialog(name, callback) {
        $("#" + name).dialog({
            autoOpen: true,
            closeOnEscape: true,
            minWidth: 500,
            modal: true,
            buttons: {
                "OK": function () {
                    $(this).dialog("close");
                    callback($(this));
                }, "Cancel": function () {
                    $(this).dialog("close");
                    callback(null);
                }
            },
            close: function () {
                $(this).hide();
                callback(false);
            }
        });
    }
    return { showBusy: showBusy, hideBusy: hideBusy, showDialog: showDialog };
}

function createEditor() {
    var editor = new Markdown.Editor(converter);
    var dialogs = createDialogs();
    editor.hooks.chain("onPreviewRefresh", function () {
        app.refreshAllocationsDisplay();
    });
    editor.hooks.set("insertImageDialog", function (callback) {
        dialogs.showDialog("getImage", function formData(data) {
            if (data === false) {
                callback(null);
            } else {
                dialogs.showBusy();
                upload(data.find("input")[0].files[0])
                    .done(function (result) {
                        dialogs.hideBusy();
                        callback(result.links.original);
                    }, function (reason) {
                        dialogs.hideBusy();
                        callback(null);
                        if (reason.code === 'InvalidFileType') {
                            alert('The file you provided was not a valid image.');
                        } else  if (reason.code === 'MissingFile') {
                            alert('You didn\'t provide an image to upload');
                        } else {
                            alert(reason.message || reason)
                            throw reason;
                        }
                    });
            }
        });
        return true; // tell the editor that we'll take care of getting the image url
    });
    editor.run();
}

module.exports = function (item) {
    /// <summary>Loads markdown and displays it in an edit control on ghe page, still in the markdown section.</summary>
    /// <param name="ID" type="String">The ID of the entity to edit markdown for.</param>
    server.markdown.read(item, function (md) {
        $("#markdown").html(template("markdownEdit", { Content: md }))
            .find("form").submit(function (e) {
            var form = e.target;
            var content = form.content.value;
            if (content !== md) {
                setStatus("Saving description");
                server.markdown.update(item._id, content, function () {
                    history.go(-1);
                    setStatus("Description saved", 2000);
                });
                return false;
            } else {
                setStatus("Description not changed", 2000);
                history.go(-1);
                return false;
            }
        });

        createEditor();
    });
}