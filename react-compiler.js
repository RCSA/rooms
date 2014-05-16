'use strict';

var fs = require('fs');
var path = require('path');
var Parser = require('jade/lib/parser.js');
var runtime = require('jade/lib/runtime.js');
var constantinople = require('constantinople');

function isConstant(str) {
  return constantinople(str);
}
function toConstant(str) {
  return constantinople.toConstant(str);
}


function parse(str, options){
  // Parse
}

function compile() {
  var str = fs.readFileSync(__dirname + '/client/view.jade', 'utf8');
  var options = {filename: path.resolve(__dirname + '/client/view.jade')};
  var parser = new (options.parser || Parser)(str, options.filename, options);
  var tokens;
  try {
    // Parse
    tokens = parser.parse();
  } catch (err) {
    parser = parser.context();
    runtime.rethrow(err, parser.filename, parser.lexer.lineno, parser.input);
  }
  var compiler = new Compiler(tokens);
  fs.writeFileSync(__dirname + '/client/view.js', 'var React = require("react");\nvar jade = require("jade/lib/runtime.js");\n\nmodule.exports = function (application) {' + compiler.compile() + '};');
}

function Compiler(node) {
  this.node = node;
}

Compiler.prototype.compile = function(){
  this.buf = ['var tags = [];'];
  this.visit(this.node);
  this.buf.push('return React.DOM.div({}, tags);');
  return this.buf.join('\n');
};
Compiler.prototype.visit = function(node){
  return this['visit' + node.type](node);
}
Compiler.prototype.visitBlock = function(block){
  for (var i = 0; i < block.nodes.length; i++) {
    this.visit(block.nodes[i]);
  }
}
Compiler.prototype.visitCode = function (code) {
  if (code.block && code.buffer) {
    throw new Error('Not Implemented');
  }
  if (code.buffer && !code.escape) {
    this.buf.push('tags.push(React.DOM.div({dangerouslySetInnerHTML:{__html: ' + code.val + '}}))');
  } else if (code.buffer) {
    this.buf.push('tags.push(' + code.val + ')');
  } else {
    this.buf.push(code.val);
    if (code.block) {
      this.buf.push('{');
      this.visit(code.block);
      this.buf.push('}');
    }
  }
};
Compiler.prototype.visitEach = function (each) {
    this.buf.push(''
      + '// iterate ' + each.obj + '\n'
      + ';(function(){\n'
      + '  var $$obj = ' + each.obj + ';\n');

    if (each.alternative) {
      this.buf.push('  if ($$obj.length) {');
    }

    this.buf.push(''
      + '    for (var ' + each.key + ' = 0, $$l = $$obj.length; ' + each.key + ' < $$l; ' + each.key + '++) {\n'
      + '      var ' + each.val + ' = $$obj[' + each.key + '];\n');

    this.visit(each.block);
    this.buf.push('  }\n}).call(this);\n');
};
Compiler.prototype.visitTag = function (tag) {
  this.buf.push('tags.push(React.DOM.' + tag.name + '(');
  
  if (tag.name === 'textarea' && tag.code && tag.code.buffer && tag.code.escape) {
    tag.attrs.push({
      name: 'value',
      val: tag.code.val
    });
    tag.code = null;
  }
  
  this.buf.push(getAttributes(tag.attrs));
  if (tag.code || (tag.block && tag.block.nodes.length)) {
    this.buf.push(', (function () { var tags = [];');
    if (tag.code) this.visitCode(tag.code);
    this.visit(tag.block);
    this.buf.push('return tags;}())');
  }
  this.buf.push('))');
};
Compiler.prototype.visitText = function (text) {
  if (/[<>&]/.test(text.val)) {
    throw new Error('Not Implemented');
  } else {
    this.buf.push('tags.push(' + JSON.stringify(text.val) + ')');
  }
};

function getAttributes(attrs){
  var buf = [];
  var classes = [];

  attrs.forEach(function(attr){
    var key = attr.name;
    if (key === 'value') key = 'defaultValue';
    if (key === 'class') {
      classes.push(attr.val);
    } else if (isConstant(attr.val)) {
      var val = toConstant(attr.val);
      buf.push(JSON.stringify(key) + ': ' + JSON.stringify(val));
    } else {
      buf.push(JSON.stringify(key) + ': ' + attr.val);
    }
  });
  if (classes.length) {
    if (classes.every(isConstant)) {
      classes = JSON.stringify(runtime.joinClasses(classes.map(toConstant)));
    } else {
      classes = 'jade.joinClasses([' + classes.join(',') + '])';
    }
    if (classes.length)
      buf.push('"className": ' + classes);
  }
  return '{' + buf.join(',') + '}';
}

module.exports = compile;
compile();
