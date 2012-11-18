var app = require('../app');
var converter = require('./converter');
var setStatus = require('../helpers/status-display').setStatus;
var Markdown = require('../libraries/pagedown.js');
var template = require('../template');

var imgurAPIKey = "e0b484465d77858ebaf6b3c7c1732909";
function upload(file, callback) {

    // file is from a <input> tag or from Drag'n Drop
    // Is the file an image?

    if (!file || !file.type.match(/image.*/)) return;

    // It is!
    // Let's build a FormData object

    var fd = new FormData();
    fd.append("image", file); // Append the file
    fd.append("key", imgurAPIKey);
    // Get your own key: http://api.imgur.com/

    // Create the XHR (Cross-Domain XHR FTW!!!)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://api.imgur.com/2/upload.json"); // Boooom!
    xhr.onload = function () {
        // Big win!
        // The URL of the image is:
        var links = JSON.parse(xhr.responseText).upload.links;
        //{delete_page, imgur_page, large_thumbnail, original, small_square};
        callback(links.original);
    }
    // Ok, I don't handle the errors. An exercice for the reader.
    // And now, we send the formdata
    xhr.send(fd);
}
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
                var files = data.find("input")[0].files; // FileList object
                if (files.length !== 1) {
                    callback(null);
                } else {
                    dialogs.showBusy();
                    upload(files[0], function (url) {
                        dialogs.hideBusy();
                        callback(url);
                    });
                }
            }
        });
        return true; // tell the editor that we'll take care of getting the image url
    });
    editor.run();
}

module.exports = function (item) {
    /// <summary>Loads markdown and displays it in an edit control on ghe page, still in the markdown section.</summary>
    /// <param name="ID" type="String">The ID of the entity to edit markdown for.</param>
    AJAX.markdown.read(item, function (md) {
        $("#markdown").html(template("markdownEdit", { Content: md }))
            .find("form").submit(function (e) {
            var form = e.target;
            var content = form.content.value;
            if (content !== md) {
                setStatus("Saving description");
                AJAX.markdown.update(item.id, content, function (result) {
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