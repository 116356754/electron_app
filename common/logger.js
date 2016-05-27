module.exports = logger;
module.exports.error = error;
//module.exports.console =console;
/**
 * In the main electron process, we do not use console.log() statements because they do
 * not show up in a convenient location when running the packaged (i.e. production)
 * version of the app. Instead use this module, which sends the logs to the main window
 * where they can be viewed in Developer Tools.
 */
var elog = require('electron-log');
var fs= require('fs');
var path = require('path');
//elog.transports.file.level = 'warning';
//elog.transports.file.format = '{h}:{i}:{s}:{ms} {text}';

var today = new Date();
var yr = today.getFullYear();
var day = today.getDay();
var filename = yr+"_"+day+'_log.txt';
// Write to this file, must be set before first logging

elog.transports.file.file = path.join(process.cwd() ,filename);

// fs.createWriteStream options, must be set before first logging
//elog.transports.file.streamConfig = { flags: 'a' };

// set existed file stream
elog.transports.file.stream = fs.createWriteStream(elog.transports.file.file,{ flags: 'a' });

//var console = {
//    log: function (...args) {
//        elog.info(...args);
//    }
//};

function logger(...args) {
  elog.info(...args);
}

function error (...args) {
  elog.error(...args);
}

//var electron = require('electron');
//
//var windows = require('./windows');
//
//var app = electron.app;
//
//function log (...args) {
//  if (app.ipcReady) {
//    windows.main.send('log', ...args);
//  } else {
//    app.on('ipcReady', () => windows.main.send('log', ...args));
//  }
//}
//
//function error (...args) {
//  if (app.ipcReady) {
//    windows.main.send('error', ...args);
//  } else {
//    app.on('ipcReady', () => windows.main.send('error', ...args));
//  }
//}
