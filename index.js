module.exports = (function() {

    'use strict';

    var PLUGIN_NAME = 'gulp-json-minify',
        gutil = require('gulp-util'),
        through2 = require('through2');

    function simpleMinify(jsonString) {
        return JSON.stringify(JSON.parse(jsonString));
    }

    function createStream(contentStream, streamReadyCallback) {

        var newStream = through2(),
            chunks = [];

        function read(){
            var chunk;
            while (null !== (chunk = contentStream.read())) {
                chunks.push(chunk);
            }
        }

        contentStream.on('readable', read);

        contentStream.once('end', function() {
            contentStream.removeListener('readable', read);
            newStream.write(simpleMinify(chunks.toString()));
            streamReadyCallback();
        });

        contentStream.on('error', function (error) {
            throw new gutil.PluginError(PLUGIN_NAME, error);
        });

        return newStream;
    }

    return function() {

        return through2.obj(function(file, enc, cb) {

            if (file.isNull()) {
                return cb(null, file);
            }
            if (file.isBuffer()) {
                file.contents = new Buffer(simpleMinify(file.contents.toString()));
                cb(null, file);
            }
            if (file.isStream()) {
                file.contents = createStream(file.contents, function () {
                    cb(null, file);
                });
            }
        });
    };
})();
