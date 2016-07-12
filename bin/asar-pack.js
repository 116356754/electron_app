/**
 * Created by Administrator on 2016/5/25.
 */
//asar p app app.asar --unpack-dir "static"

var asar = require('asar');
var path =require('path');

var src = path.join(__dirname,'..');
var dest = path.join(__dirname,'..','..','app.asar');

asar.createPackageWithOptions(src, dest,{
  dot:false,
  unpackDir:"static",
  unpack:'config.js'
}, function() {
  console.log('done.');
});