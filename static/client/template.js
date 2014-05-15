var templates = {
    allocationEdit: '<h1>Edit allocations for accademic year beginning {{year}}</h1><hr /><div> {{#staircases}} <div class="allocationBlock"><h2>{{{name}}}</h2> {{#rooms}} <form data-old-allocation="{{allocation}}" data-roomid="{{_id}}"> {{name}}: <input name="allocation" type="text" value="{{allocation}}" /></form> {{/rooms}} </div> {{/staircases}}</div>',
    choosingOrderEdit: '<div id="tabs"><ul><li><a href="#tabs-1">First Years</a></li><li><a href="#tabs-2">Second Years</a></li><li><a href="#tabs-3">Third Years</a></li></ul><div id="tabs-1"><ul id="sortable" class="sortable"><li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Joe Blogs <button> Delete</button></li><li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>John Smith </li></ul></div><div id="tabs-2"> Second Years </div><div id="tabs-3"> Third Years </div></div>',
    markdownEdit: '<form><div class="wmd-panel"><div id="wmd-button-bar"></div><textarea class="wmd-input" id="wmd-input" name="content">{{{Content}}}</textarea></div><div id="wmd-preview" class="wmd-panel wmd-preview"></div><input type="submit" value="Save" /></form><div id="getImage" class="dialog" title="Insert Image"><label> Select an image to upload</label><br /><input type="file" required /></div><div id="busy" class="dialog" title="Uploading"><div class="ajaxLoader"></div></div><div id="getURL" class="dialog" title="Insert Hyperlink"><form><label> http://example.com/ "optional title"</label><br /><input name="fileUpload" type="url" value="http://" /><br /></form></div>',
    NavigationList: '{{#Links}} <a href="{{url}}" {{#selected}}class="Selected"{{/selected}}>{{{name}}}</a>{{/Links}}',
    projector: '{{#staircases}}<div class="projectorBlock"><h1><a href="{{url}}">{{{name}}}</a></h1><ul> {{#rooms}} <li id="{{_id}}" class="{{css}}"><a href="{{url}}">{{{name}}}<span class="allocationDisplayPart"> - <span class="allocationDisplay" data-roomid="{{_id}}"></span></span></a></li> {{/rooms}} </ul></div>{{/staircases}}',
    room: '{{#rentband}}<table class="horizontalTable"><tr><th> Bathroom </th><td> {{bathroom}} </td></tr><tr><th> Rent Band </th><td> {{rentBandDescription}} </td></tr><tr><th> Floor </th><td> {{floorDescription}} </td></tr><tr><th> Current Allocation </th><td><span class="allocationDisplay" data-roomid="{{_id}}" data-year="current"></span></td></tr><tr><th> Next Year\'s Allocation </th><td><span class="allocationDisplay" data-roomid="{{_id}}" data-year="next"></span></td></tr></table>{{/rentband}}',
    staircase: '{{#Floors}}<h2> {{Name}}</h2><ul> {{#Rooms}} <li><a href="{{url}}">{{nameSingleLine}}{{#rentband}} - {{#bathroom}}{{bathroom}}, {{/bathroom}}{{rentBandDescription}}, <span class="allocationDisplay" data-roomid="{{_id}}"></span>{{/rentband}}</a></li> {{/Rooms}}</ul>{{/Floors}}'
};

function template(templateName, view) {
    /// <summary>Apply the template to the view and return the resulting html.</summary>
    /// <param name="templateName" type="String">The name of the template to use</param>
    /// <param name="view" type="Object?">The object to apply to the template</param>
    /// <returns type="String" />
    if (arguments.length === 2) {
        return Mustache.to_html(templates[templateName], view);
    } else if (arguments.length === 1) {
        return function (view) {
            return Mustache.to_html(templates[templateName], view);
        }
    }
}
template.templates = templates;

module.exports = template;