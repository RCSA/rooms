var $ = jQuery;
module.exports = makeTable;
function makeTable(selector, callback) {
    $(selector).find("td").each(function () {
        var self = $(this);

        var input = self.find("input,select");
        if (input.length === 0) {
            return;
        }

        self.dblclick(function () {
            var label = self.find("div");
            label.hide();
            input.show().focus();
        });
        input.blur(function () {
            var label = self.find("div");
            var Name = self.attr("itemprop");
            var ID = self.parents("tr").attr("itemid");
            var Value = input.attr("type")==="number"?Number(input.hide().val()):input.hide().val();
            var OldValue = label.html();
            if (OldValue !== Value) {
                if (callback(ID, Name, Value) === false) {
                    input.val(OldValue);
                    label.show();
                } else {
                    label.show().html(Value);
                }
            } else {
                label.show();
            }
        });
    })
}