/**
 * Created by Administrator on 2016/4/26.
 */
"use strict";

var electron = require('electron');
var app = electron.app;

var process=require('process');
var os = require('os');

var isrender =require('./is-renderer');

module.exports = {
    getProcessVersion,
    getElectronVersion,
    getAppVersion,
    isWin7plusOS
};

function getProcessVersion () {
    return process.versions;
}

function getElectronVersion()
{
    return process.versions.electron
}

function getAppVersion()
{
    if(isrender) {
        var remote = electron.remote;
        return remote.app.getVersion();
    }
    else
        return electron.app.getVersion();
}

function isWin7plusOS()
{
    var os_ver = os.release();
    //var os_ver = '6.2.7601';
    console.log('the release of the os is: ' + os_ver);
    var ver = parseFloat(os_ver);
    console.log(ver);
    
    if(ver>=6.1)
    {
      console.log('win 7');
      return true;
    }        
    else
    {
      console.log('win 7-');
      return false;
    }        
}