'use strict';

var assert = require('assert');
var uid = require('uid');

module.exports = createCollection;
function createCollection(name, channel) {
  var collection = [];
  collection.isLoaded = false;
  collection.getIndex = function (id) {
    for (var i = 0; i < collection.length; i++) {
      if (collection[i].id === id) return i;
    }
    return -1;
  };

  var onUpdate = subscribable(collection);

  channel.on('data', function (message) {
    assert(typeof message.collection === 'string');
    assert(typeof message.id === 'string');
    assert(message.action === 'insert' || message.action === 'update' || message.action === 'delete' || message.action === 'ready');
    assert(typeof message.properties === 'object' && message.properties != null);
    if (message.collection !== name) return;
    switch (message.action) {
      case 'insert':
        var index = collection.getIndex(message.id);
        if (index !== -1) collection.splice(index, 1);
        assert(message.properties.id === message.id);
        collection.push(record(name, message.properties, channel).subscribe(onUpdate));
        onUpdate();
        break;
      case 'delete':
        var index = collection.getIndex(message.id);
        if (index !== -1) collection.splice(index, 1);
        onUpdate();
        break;
      case 'ready':
        collection.isLoaded = true;
        onUpdate();
        break;
    }
  });
  channel.write({collection: name, action: 'read'});

  return collection;
}

function record(collection, properties, channel) {
  var onUpdate = subscribable(properties);
  var pending = {};
  var remote = {};
  channel.on('data', function (message) {
    if (message.collection !== collection) return;
    if (message.id !== properties.id) return;
    if (message.action !== 'update') return;
    Object.keys(message.properties).forEach(function (property) {
      remote[property] = message.properties[property];
      pending[property] = (pending[property] || []).filter(function (guid) {
        return guid !== message.guid;
      });
      if (pending[property].length === 0) {
        setInternal(property, message.properties[property]);
      }
    });
    onUpdate();
  });
  function setInternal(name, value) {
    name = name.split('.');
    assert(name[0] !== 'set');
    assert(name[0] !== 'id');
    var obj = properties;
    for (var i = 0; i < name.length - 1; i++) {
      obj = obj[name[i]];
    }
    obj[name[name.length - 1]] = value;
  }
  properties.set = function (name, value) {
    setInternal(name, value);
    var guid = uid();
    pending[name] = pending[name] || [];
    pending[name].push(guid);
    var message = {
      collection: collection,
      id: properties.id,
      guid: guid,
      action: 'update',
      properties: {}
    };
    message.properties[name] = value;
    channel.write(message);
    onUpdate();
  };
  return properties;
}

function subscribable(obj) {
  var subscribers = [];
  obj.subscribe = function (fn) {
    assert(typeof fn === 'function');
    subscribers.push(fn);
    return this;
  };
  function onUpdate() {
    subscribers.forEach(function (subscriber) {
      subscriber();
    });
  }
  return onUpdate;
}
