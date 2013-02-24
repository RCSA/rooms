var mongo = require('mongojs');
var settings = require('../settings');

module.exports = createClient;
function createClient() {
  var url = settings.get('RCSA_MONGO_USER') + ':' +
            settings.get('RCSA_MONGO_PASS') + '@' +
            settings.get('RCSA_MONGO_DB');
  return mongo(url, ['allocations', 'navigation']);
}

//db.allocations.update({year: 2012}, {$set: { 'allocations.foo': 'bar' } }, {upsert: true}, console.log)
//db.allocations.findOne({year: 2013}, console.log) //(returns null not an error)