/*两个事件
 事件：'check-validate'
 当发现框架或者app的MD5值均匹配时触发

 事件：'check-not-validate'
 当发现框架或者app的MD5值不匹配时触发
 */

var path =require('path');
var events = require("events");
var EventEmitter = events.EventEmitter;
var util = require('util');

var md5File = require('md5-file');
var hasher = require('hash-dir-contents');

function CheckSumer() {
    EventEmitter.call(this)
}
util.inherits(CheckSumer, EventEmitter);

CheckSumer.prototype.start = function(remoteFrameSign,remoteAppSign)
{
    this.remoteFrameSign = remoteFrameSign;
    this.remoteAppSign = remoteAppSign;
    //if(this.frameSign())
   //     this.appSign();
};

CheckSumer.prototype.frameSign = function (filepath)
{
    //59120c11e494586ef09277942066184c
    console.time('md5-file');
    //log(filepath);
    var signature = md5File(filepath);
    console.log(signature);
    console.timeEnd('md5-file');
    if(this.remoteFrameSign != signature)
        this.emit('check-not-validate');
};

CheckSumer.prototype.appSign = function (dirpath)
{
    var self = this;
    //var dirpath =path.join(process.cwd(),"resources",'app_bak.asar');
    console.log(dirpath);
    //45b83d98593ba8425e59d125d45bb053
    console.time('md5-dir');
    hasher({
        directory: dirpath,
        algorithm: 'md5'
    }, function(error, signature) {
        console.log(self.remoteAppSign);
        if (self.remoteAppSign != signature)
            self.emit('check-not-validate');
        else
            self.emit('check-validate');

        console.log(signature);
        console.timeEnd('md5-dir');
    });
};

module.exports = new CheckSumer();

//var appcheck = require('./checksum');
//
//appcheck.on('check-validate', ()=> console.log('check app and frame is validate!'));
//
//appcheck.on('check-not-validate', ()=> {
//console.log('not validate!');
//});
//
//appcheck.start('123', '456');//检查程序是否有效的md5值
//appcheck.appSign(path.join('E:/electron_app/resources','app_bak.asar'));
//
//setInterval(()=>{
//    console.log('alive');
//}, 300);
