var knox = require('knox');
var settings = require('./settings');

module.exports = createClient;
function createClient() {
  return knox.createClient({
    bucket: settings.get('RCSA_S3_BUCKET'),
    key: settings.get('RCSA_S3_KEY'),
    secret: settings.get('RCSA_S3_SECRET'),
    region: settings.get('RCSA_S3_REGION')
  });
}