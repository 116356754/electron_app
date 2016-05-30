/**
 * Created by Administrator on 2016/4/26.
 */
"use strict";

var electron = require('electron');
var app = electron.app;

var process=require('process');
var os = require('os');

var is =require('elis');

module.exports = {
    getProcessVersion,
    getElectronVersion,
    getAppVersion
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
    if(is.renderer()) {
        var remote = electron.remote;
        return remote.app.getVersion();
    }
    else
        return electron.app.getVersion();
}