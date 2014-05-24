'use strict';

var Promise = require('promise');
var mongod = require('mongod');
var db = mongod(process.env.ROOMS_MONGO, ['pages']);

db.pages.find().then(function (pages) {
  console.log('got pages: ' + pages.length);
  return Promise.all(pages.map(function (page) {
    console.log('uploading ' + page._id);
    return db.pages.update({_id: page._id}, {
      '$set': {
        name: page.name.replace(/ *\<br\/> */g, ' '),
        body: page.body.trim().replace(/^.*\r?\n\=+/g, '').trim()
      }
    });
  }));
}).then(function () {
  console.log('done');
  db.close();
}).done();