var config;

try {
  config = require('./config.json');
} catch (ex) {}

exports.get = function (key) {
  return process.env[key] || (config && config[key]);
}