var React = require("react");
var jade = require("jade/lib/runtime.js");

module.exports = function (application) {var tags = [];
tags.push(React.DOM.div(
{"className": "header"}
, (function () { var tags = [];
tags.push(React.DOM.input(
{"id": "isThisYears","type": "checkbox"}
))
tags.push("Show this year's room allocations instead of next years.")
tags.push(React.DOM.span(
{"style": {"float":"right"}}
, (function () { var tags = [];
tags.push("Created by Forbes Lindesay for the RCSA")
return tags;}())
))
tags.push(React.DOM.a(
{"href": "/"}
, (function () { var tags = [];
tags.push(React.DOM.div(
{"className": "rcsalogo"}
))
return tags;}())
))
tags.push(React.DOM.div(
{"className": "shortcutLinks"}
, (function () { var tags = [];
tags.push(React.DOM.a(
{"href": "/"}
, (function () { var tags = [];
tags.push("Home")
return tags;}())
))
tags.push(' | ')
tags.push(React.DOM.a(
{"href": "/projector"}
, (function () { var tags = [];
tags.push("Projector")
return tags;}())
))
return tags;}())
))
return tags;}())
))
if ( application.loading)
{
tags.push("Loading...")
}
else
{
tags.push(React.DOM.div(
{"id": "colmask","className": "colmask"}
, (function () { var tags = [];
tags.push(React.DOM.div(
{"id": "staircases","className": "column nav"}
, (function () { var tags = [];
// iterate application.topLevelPages()
;(function(){
  var $$obj = application.topLevelPages();

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var page = $$obj[$index];

tags.push(React.DOM.a(
{"href": page.getHref(),"className": jade.joinClasses([application.isSelected(page) ? 'Selected' : false])}
, (function () { var tags = [];
tags.push(page.getName())
return tags;}())
))
  }
}).call(this);

return tags;}())
))
tags.push(React.DOM.div(
{"id": "rooms","className": "column nav"}
, (function () { var tags = [];
// iterate application.secondLevelPages()
;(function(){
  var $$obj = application.secondLevelPages();

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var page = $$obj[$index];

tags.push(React.DOM.a(
{"href": page.getHref(),"className": jade.joinClasses([application.isSelected(page) ? 'Selected' : false])}
, (function () { var tags = [];
tags.push(page.getName())
return tags;}())
))
  }
}).call(this);

return tags;}())
))
tags.push(React.DOM.div(
{"id": "main","className": "column"}
, (function () { var tags = [];
tags.push(React.DOM.div(
{"id": "markdown"}
, (function () { var tags = [];
if ( !application.editMode)
{
if ( application.currentPage.data._id === '/')
{
tags.push(React.DOM.img(
{"src": "http://i.imgur.com/hPFV0.png","alt": "RCSA Logo","style": {"float":"right"}}
))
}
else
{
tags.push(React.DOM.h1(
{}
, (function () { var tags = [];
tags.push(application.currentPage.getName())
return tags;}())
))
}
tags.push(React.DOM.div({dangerouslySetInnerHTML:{__html: application.currentPage.getHtmlBody()}}))
if ( application.user.isAuthenticated)
{
if ( application.currentPage.data.type === 'room' || application.currentPage.data.type === 'staircase')
{
tags.push(React.DOM.a(
{"href": "?edit=true"}
, (function () { var tags = [];
tags.push("Edit Page")
return tags;}())
))
}
else if ( application.user.isAdmin)
{
tags.push(React.DOM.a(
{"href": "?edit=true"}
, (function () { var tags = [];
tags.push("Edit Page")
return tags;}())
))
}
}
}
else
{
if ( application.currentPage.data._id !== '/')
{
tags.push(React.DOM.h1(
{}
, (function () { var tags = [];
tags.push(application.currentPage.getName())
return tags;}())
))
}
tags.push(React.DOM.textarea(
{"onChange": application.currentPage.setMarkdownBody.bind(application.currentPage),"defaultValue": application.currentPage.getMarkdownBody()}
))
tags.push(React.DOM.br(
{}
))
tags.push(React.DOM.button(
{"onClick": application.currentPage.saveMarkdownBody.bind(application.currentPage)}
, (function () { var tags = [];
tags.push("Save")
return tags;}())
))
}
return tags;}())
))
tags.push(React.DOM.div(
{"id": "templated"}
, (function () { var tags = [];
if ( application.currentPage.isRoom())
{
tags.push(React.DOM.table(
{"className": "horizontalTable"}
, (function () { var tags = [];
if ( application.currentPage.getBathroomDescription())
{
tags.push(React.DOM.tr(
{}
, (function () { var tags = [];
tags.push(React.DOM.th(
{}
, (function () { var tags = [];
tags.push("Bathroom")
return tags;}())
))
tags.push(React.DOM.td(
{}
, (function () { var tags = [];
tags.push(application.currentPage.getBathroomDescription())
return tags;}())
))
return tags;}())
))
}
tags.push(React.DOM.tr(
{}
, (function () { var tags = [];
tags.push(React.DOM.th(
{}
, (function () { var tags = [];
tags.push("Rent Band")
return tags;}())
))
tags.push(React.DOM.td(
{}
, (function () { var tags = [];
tags.push(application.currentPage.getRentBandDescription())
return tags;}())
))
return tags;}())
))
tags.push(React.DOM.tr(
{}
, (function () { var tags = [];
tags.push(React.DOM.th(
{}
, (function () { var tags = [];
tags.push("Floor")
return tags;}())
))
tags.push(React.DOM.td(
{}
, (function () { var tags = [];
tags.push(application.currentPage.getFloorDescription())
return tags;}())
))
return tags;}())
))
if ( application.user.isAuthenticated)
{
tags.push(React.DOM.tr(
{}
, (function () { var tags = [];
tags.push(React.DOM.th(
{}
, (function () { var tags = [];
tags.push("Current Allocation")
return tags;}())
))
tags.push(React.DOM.td(
{}
, (function () { var tags = [];
tags.push(application.currentPage.getCurrentYearAllocation())
return tags;}())
))
return tags;}())
))
tags.push(React.DOM.tr(
{}
, (function () { var tags = [];
tags.push(React.DOM.th(
{}
, (function () { var tags = [];
tags.push("Next Year's Allocation")
return tags;}())
))
tags.push(React.DOM.td(
{}
, (function () { var tags = [];
tags.push(application.currentPage.getNextYearAllocation())
return tags;}())
))
return tags;}())
))
}
return tags;}())
))
}
return tags;}())
))
return tags;}())
))
return tags;}())
))
}
return React.DOM.div({}, tags);};