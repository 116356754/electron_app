/**
 * Created by Administrator on 2016/6/7.
 */
'use strict'

var crypto = require('crypto')
var fs = require('fs')

function md5File (filename, cb) {
    if (typeof cb !== 'function') throw new TypeError('Argument cb must be a function')

    var output = crypto.createHash('md5')
    var input = fs.createReadStream(filename)

    input.on('error', function (err) {
        cb(err)
    })

    output.once('readable', function () {
        cb(null, output.read().toString('hex'))
    })

    input.pipe(output)
}
md5File('E:/electron_app/Titan.exe',function (err, hash) {
    console.log('exe hash result is '+hash);
});

md5File('E:/electron_app/resources/app.asar',function (err, hash) {
    console.log('app hash result is '+hash);
});