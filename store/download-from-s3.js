var knox = require('knox');
var join = require('path').join;
var dirname = require('path').dirname;
var mkdirp = require('mkdirp');
var write = require('fs').createWriteStream;
var s3Client = require('./s3-client');

module.exports = download;
function download(cb) {
  var client = s3Client();

  client.list({
    //delimiter: '/'
    //, marker: true
    //, 'max-keys': 10
    //, prefix: true
  }, function (err, res) {
    process.nextTick(function () {
      if (err) throw err;
      if (res.isTruncated) throw new Error('There are more than 1000 files, something must be done')
      console.log(res.Contents.length);
      var files = res.Contents.map(function (file) { return file.Key; });
      var tasks = files.length;
      files.forEach(function (file) {
        mkdirp.sync(dirname(join(__dirname, '..', 'data', file)));
        client.getFile(file, function (err, res) {
          if (err) throw err;
          //console.log('GET: ' + file);
          var strm = res.pipe(write(join(__dirname, '..', 'data', file)));
          strm.on('close', done);
        });
      });
      function done() {
        if (0 === --tasks) return cb();
      }
    });
  });
}