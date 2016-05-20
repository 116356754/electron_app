/**
 * Created by Administrator on 2016/5/20.
 */
var http = require('http');
var url = require('url');
var path =require('path');
var downloadHTTP = require('download-http');
var process = require('process');
//引入events模块
var events = require("events");
//实例化events.EventEmitter对象
var event = new events.EventEmitter();

exports.checkVersion=function(feed,cb)
{
    console.log(feed);
    getRemoteJson(feed.updateURL);

    event.on('update-json',function(ver){
        var updateExeObj={};

        if(ver == null)
            cb('version json is null',updateExeObj);

        if(compareMainFrameVersion(ver,feed.frameVer))//主框架需要更新
        {
            updateExeObj.neeedUpdate =true;
            updateExeObj.version = ver.windows.Version;
            updateExeObj.downloadurl = ver.windows.updateUrl;
            return cb(null,updateExeObj);
        }
        else
        {
            if(compareAppVersion(ver,feed.appVer))//app需要更新
            {
                updateExeObj.neeedUpdate =true;
                updateExeObj.version = ver.windows.resourceVersion;
                updateExeObj.downloadurl = ver.windows.resourceUrl;
                return cb(null,updateExeObj);
            }
        }
        updateExeObj.neeedUpdate =false;
        updateExeObj.frameMD5 = ver.windows.frameSign;
        updateExeObj.appMD5 =ver.windows.appSign;

        return cb(null,updateExeObj);//不需要更新
    });
    event.on('update-err',function(errmsg){
        cb(errmsg);
    })

};

//2.获取服务端的json版本文件
//内部方法
function getRemoteJson(feedUrl)
{
    console.log('http get from url:' + feedUrl);
    var urlobj = url.parse(feedUrl);

    var options = {
        hostname: urlobj.hostname,
        port: urlobj.port,
        path: urlobj.path,
        method: 'GET'
    };
    //console.log(options);
    var req = http.request(options, function (res) {
        var data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk.toString();
        });

        res.on('end', function (err, result) {
            var versionJson = JSON.parse(data);
            // console.log('json: ' +  versionJson.windows.Version);
            event.emit('update-json',versionJson);
        });
    });

    req.on('error', function (err) {
        console.log('problem with http request: ' + err.message);
        event.emit('update-err',err.message);
    });
    req.end();
}

//3.版本比较
//版本比较函数
var needUpdate = function (currVer, promoteVer) {
    currVer = currVer ? currVer.replace(/[vV]/, "") : "0.0.0";
    promoteVer = promoteVer ? promoteVer.replace(/[vV]/, "") : "0.0.0";
    if (currVer == promoteVer) return false;
    var currVerArr = currVer.split(".");
    var promoteVerArr = promoteVer.split(".");
    var len = Math.max(currVerArr.length, promoteVerArr.length);
    for (var i = 0; i < len; i++) {
        var proVal = ~~promoteVerArr[i],
            curVal = ~~currVerArr[i];
        if (proVal < curVal) {
            return false;
        } else if (proVal > curVal) {
            return true;
        }
    }
    return false;
};

var compareMainFrameVersion = function (versionJsonObj,mainframever) {
    //console.log(versionJsonObj);

    //var mainframever = process.versions.electron;
    //var mainframever= '0.36.3';
    console.log('current main framework Version ' + mainframever);

    console.log('remote main framework Version ' + versionJsonObj.windows.Version);
    var isneed = needUpdate(mainframever, versionJsonObj.windows.Version);

    console.log(isneed ? "we need update main framework " : "we don't need update main framework ");

    return isneed;
};

//资源文件版本比较
var compareAppVersion = function (versionJsonObj,appversion) {
    //var appversion='1.5.0';
    console.log('start  compare Version ' + versionJsonObj.windows.resourceVersion);
    //var isneed = needUpdate(app.getVersion(), versionJsonObj.windows.resourceVersion);
    var isneed = needUpdate(appversion,versionJsonObj.windows.resourceVersion);

    console.log(isneed ? "we need update app resource " : "we don't need update app resource ");

    return isneed;
};
//下载文件功能


exports.download = function (updateURL,downloadPath, callback) {
    console.log('download url is :' + updateURL);
    //console.log(app.getPath('downloads'));
   // var downloads="C:/Users/Administrator/Downloads";
    downloadHTTP(updateURL, downloadPath, function (error) {
        //downloadHTTP(updateURL, downloads, function (error) {
        if (error) {
            callback(error, null);
        }
        else {
            console.log("download over");
            var uri = updateURL.split('/');
            var filename = uri[uri.length - 1];
            callback(null, path.join(downloadPath , filename));
            //callback(null, path.join(downloads,filename));
        }
    });
};


