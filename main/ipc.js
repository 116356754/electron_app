module.exports = {
    init
};

var electron = require('electron');
var app = electron.app;
var ipcMain = electron.ipcMain;
var powerSaveBlocker = electron.powerSaveBlocker;
var BrowserWindow = electron.BrowserWindow;

var menu = require('./menu');
var windows = require('./windows');
var shortcuts = require('./shortcuts');

// has to be a number, not a boolean, and undefined throws an error
var powerSaveBlockID = 0;

function init() {
    ipcMain.on('ipcReady', function (e) {
        app.ipcReady = true;
        app.emit('ipcReady');
        windows.main.show();
        console.timeEnd('init');
    });

    ipcMain.on('toggleFullScreen', function (e, flag) {
        menu.toggleFullScreen(flag)
    });

    ipcMain.on('blockPowerSave', blockPowerSave);
    ipcMain.on('unblockPowerSave', unblockPowerSave);

    //新建窗口
    ipcMain.on('create-window', onCreateWindow);

    //新建tearout窗口
    ipcMain.on('tearout-window', onCreateTearoutWindow);

    var oldEmit = ipcMain.emit;
    ipcMain.emit = function (name, e, target, ...args) {
        // Relay messages between the main window and the WebTorrent hidden window
        if (name.startsWith('wt-')) {
            var sourceTitle  = e.sender.browserWindowOptions.title;
            console.log(sourceTitle);
            electron.BrowserWindow.getAllWindows().forEach(wins => {
                if(target=='all')
                {
                    if(sourceTitle.toUpperCase()!=wins.getTitle().toUpperCase())//排除发送给自己
                        wins.send(name, ...args);
                }
                else{
                    if(wins.getTitle().toUpperCase()==target.toUpperCase())
                        wins.send(name, ...args);
                }
            });
            return;
        }
        // Emit all other events normally
        oldEmit.call(ipcMain, name, e,target, ...args)
    };

    //网络状态判断
    ipcMain.on('online-status-changed', function (event, status) {
        console.log(status);
        /*if(!status)
         setTimeout(() => app.quit(), 1000) ;/!* quit after 2 secs, at most *!/*/
         //if(!status)
         //   windows.main.setOverlayIcon(nativeImage.createFromPath(iconPath('dot.png')), total + ' items');
    });
}

function blockPowerSave() {
    powerSaveBlockID = powerSaveBlocker.start('prevent-display-sleep');
    console.log('blockPowerSave %d', powerSaveBlockID);
}

function unblockPowerSave() {
    if (powerSaveBlocker.isStarted(powerSaveBlockID)) {
        powerSaveBlocker.stop(powerSaveBlockID);
        console.log('unblockPowerSave %d', powerSaveBlockID);
    }
}

function onCreateWindow(event, argurl) {
    "use strict";
    console.log('create new window ' + argurl);
    windows.createOtherWindow(argurl);
    setTimeout(function () {
        windows.focusWindow(windows.other);
    }, 100);
}

function onCreateTearoutWindow(event, argurl,dom) {
    "use strict";
    //console.log('create tearout window ' + argurl);
    //console.log('create tearout window ' + dom);
    windows.createTearoutWindow(argurl,dom);
    setTimeout(function () {
        windows.focusWindow(windows.tearout);
    }, 100);
}