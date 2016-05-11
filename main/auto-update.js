module.exports = {init};

const electron = require('electron');
const dialog = electron.dialog;
const app = electron.app;
var config = require('../config');
/**
 * Created by Administrator on 2016/4/21.
 */

var async = require('async');

var EMAutoupdateResult =
{
    NoNeedUpdate: 1,
    UpdateMainFrame: 2,
    UpdateApp: 3,
    UpdateErr: 4
};

var http = require('http');
var url = require('url');
//get服务器上的json的版本信息文件，然后获取的对象传给版本比较函数
var http_getversion = function (arg, callback) {
    console.log('http get from url:' + arg);
    var urlobj = url.parse(arg);

    var versionJson = {};

    var options = {
        hostname: urlobj.hostname,
        port: urlobj.port,
        path: urlobj.path,
        method: 'GET'
    };
    console.log(options);
    var req = http.request(options, function (res) {
        var data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk.toString();
        });

        res.on('end', function (err, result) {
            versionJson = JSON.parse(data);
            // console.log('json: ' +  versionJson.windows.Version);
            return callback(null, versionJson);
        });
    });

    req.on('error', function (err) {
        console.log('problem with http request: ' + err.message);
        return callback(err, EMAutoupdateResult.UpdateErr);
    });
    req.end();
};

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

var compareMainFrameVersion = function (versionJsonObj) {
    //console.log(versionJsonObj);
    var ver = require('process');
    var mainframever = ver.versions.electron;
    //var mainframever= '0.36.3';
    console.log('current main framework Version ' + mainframever);

    console.log('remote main framework Version ' + versionJsonObj.windows.Version);
    var isneed = needUpdate(mainframever, versionJsonObj.windows.Version);

    console.log(isneed ? "we need update main framework " : "we don't need update main framework ");

    return isneed;
};

//资源文件版本比较
var compareAppVersion = function (versionJsonObj) {
    // var appversion='1.5.0';
    console.log('start  compare Version ' + versionJsonObj.windows.resourceVersion);
    var isneed = needUpdate(app.getVersion(), versionJsonObj.windows.resourceVersion);
    //var isneed = needUpdate(appversion,versionJsonObj.windows.resourceVersion);

    console.log(isneed ? "we need update app resource " : "we don't need update app resource ");

    return isneed;
};

//下载文件功能
var downloadHTTP = require('download-http');
var downloadUpdateRes = function (resUrl, callback) {
    console.log('download url is :' + resUrl);
    //console.log(app.getPath('downloads'));
    //var downloads="C:/Users/Administrator/Downloads";
    downloadHTTP(resUrl, app.getPath('downloads'), function (error) {
        //downloadHTTP(resUrl, downloads, function (error) {
        if (error) {
            callback(error, EMAutoupdateResult.UpdateErr);
        }
        else {
            console.log("download over");
            var uri = resUrl.split('/');
            var filename = uri[uri.length - 1];
            callback(null, app.getPath('downloads') + '/' + filename);
        }
    });
};

var fs = require('fs');
var isMainFrameNeedUpdate = false;
var wait = function (mils) {
    //刻意等待mils的时间，mils的单位是毫秒。
    var now = new Date;
    while (new Date - now <= mils);
};

var excuteExe = function (exefilepath, callback) {
    console.log(exefilepath);
    if (!fs.existsSync(exefilepath)) {
        console.log('exe is not exist!');
        return callback('exe is not exist!', EMAutoupdateResult.UpdateErr);
    }
    setTimeout(function () {
        try {
            var shell = require('shell');

            shell.openExternal(exefilepath);
            return callback(null);
        }
        catch (e) {
            return callback(e, EMAutoupdateResult.UpdateErr);
        }
    }, 200);
};

var subcomparewaterfall = function (verJsonObj, callback) {
    console.log('subwaterfall ' + verJsonObj);
    var urlpath = "";
    isMainFrameNeedUpdate = false;
    if (compareMainFrameVersion(verJsonObj))//主版本更新
    {

        var index = dialog.showMessageBox({
            type: "none",
            title: 'confirm update',
            message: 'Do you want to update new framework exe?',
            buttons: ['OK', 'Cancel']
        });

        if (index == 1)
            return callback(null, EMAutoupdateResult.NoNeedUpdate);

        urlpath = verJsonObj.windows.updateUrl;
        isMainFrameNeedUpdate = true;
    }
    else {//资源文件更新
        if (compareAppVersion(verJsonObj)) {
            var index = dialog.showMessageBox({
                type: "none",
                title: 'confirm update',
                message: 'Do you want to update new resource file?',
                buttons: ['OK', 'Cancel']
            });

            if (index == 1)
                return callback(null, EMAutoupdateResult.NoNeedUpdate);

            urlpath = verJsonObj.windows.resourceUrl;
            isMainFrameNeedUpdate = false;
        }
        else {
            return callback(null, EMAutoupdateResult.NoNeedUpdate);
        }
    }
    async.waterfall(
        [async.constant(urlpath), downloadUpdateRes, excuteExe], function (err, results) {
            if (err)
                return callback(err, EMAutoupdateResult.UpdateErr);
            //console.log(results);
            return callback(null, isMainFrameNeedUpdate ? EMAutoupdateResult.UpdateMainFrame : EMAutoupdateResult.UpdateApp);
        });
};

function init (cb)
{
    async.waterfall([
        async.constant(config.AUTO_UPDATE_URL),
        http_getversion,
        subcomparewaterfall
    ], function (err, results) {
        if (err)
            console.log('ERR: auto update is failed: ' + err);

        console.log('waterfall result is:' + results);
        cb(results);
    });
}

