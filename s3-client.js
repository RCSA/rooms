var knox = require('knox');

module.exports = createClient;
function createClient(settings) {
  settings = settings || {};
  return knox.createClient({
    bucket: settings.bucket || process.env.RCSA_S3_BUCKET,
    key: settings.key || process.env.RCSA_S3_KEY,
    secret: settings.secret || process.env.RCSA_S3_SECRET,
    region: settings.region || process.env.RCSA_S3_REGION
  });
}