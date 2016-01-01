module.exports = (function() {

    'use strict';

    var through2 = require('through2'),
        jsonMinify = require('node-json-minify');

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
            newStream.write(jsonMinify(chunks.toString()));
            streamReadyCallback();
        });

        return newStream;
    }

    return function() {
        return through2.obj(function(file, enc, cb) {

            if (file.isNull()) {
                return cb(null, file);
            }
            if (file.isBuffer()) {
                file.contents = new Buffer(jsonMinify(file.contents.toString()));
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