module.exports = {
    init
};

var electron = require('electron');

var app = electron.app;
var ipcMain = electron.ipcMain;
var powerSaveBlocker = electron.powerSaveBlocker;
var BrowserWindow = electron.BrowserWindow;

//var console = require('./../common/log');
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

    ipcMain.on('setBounds', function (e, bounds, maximize) {
        setBounds(bounds, maximize)
    });

    ipcMain.on('setAspectRatio', function (e, aspectRatio, extraSize) {
        setAspectRatio(aspectRatio, extraSize)
    });

    ipcMain.on('setProgress', function (e, progress) {
        setProgress(progress)
    });

    ipcMain.on('toggleFullScreen', function (e, flag) {
        menu.toggleFullScreen(flag)
    });

    ipcMain.on('setTitle', function (e, title) {
        windows.main.setTitle(title)
    });

    ipcMain.on('blockPowerSave', blockPowerSave);
    ipcMain.on('unblockPowerSave', unblockPowerSave);

    ipcMain.on('focusWindow', function (e, windowName) {
        windows.focusWindow(windows[windowName])
    });

    //新建窗口
    ipcMain.on('create-window', onCreateWindow);

    //新建提示窗口
    ipcMain.on('create-notiwindow', onCreateNotiWindow);

    //新建tearout窗口
    ipcMain.on('tearout-window', onCreateTearoutWindow);

    ipcMain.on('min-window', onMinimize);

    ipcMain.on('max-window', onMaxmize);

    ipcMain.on('close-window', onClose);

    /*
    // Capture all events
    var messageQueueMainToWebTorrent = [];
    ipcMain.on('ipcReadyOther', function (e) {
        app.ipcReadyOther = true;
        log('sending %d queued messages from the main win to the other window',
            messageQueueMainToWebTorrent.length);
        messageQueueMainToWebTorrent.forEach(function (message) {
            windows.other.send(message.name, ...message.args);
            log('other window: sent queued %s', message.name)
        })
    });

    var oldEmit = ipcMain.emit;
     ipcMain.emit = function (name, e, ...args) {
     // Relay messages between the main window and the WebTorrent hidden window
     if (name.startsWith('wt-')) {
     console.log(e.sender.browserWindowOptions.title);
     if (e.sender.browserWindowOptions.title === 'Titan-other') {  //给主窗口发消息
     // Send message to main window
     windows.main.send(name, ...args);
     console.log('main window: got %s content : %s', name, args);
     } else if (app.ipcReadyOther) {  //给other窗口发消息
     // Send message to other window
     windows.other.send(name, ...args);
     log('main window: sent %s', name);
     } else {
     // Queue message for webtorrent window, it hasn't finished loading yet
     messageQueueMainToWebTorrent.push({
     name: name,
     args: args
     });
     log('other window: queueing %s', name);
     }
     return;
     }

     // Emit all other events normally
     oldEmit.call(ipcMain, name, e, ...args)
     };*/

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

function setBounds(bounds, maximize) {
    // Do nothing in fullscreen
    if (!windows.main || windows.main.isFullScreen()) {
        console.log('setBounds: not setting bounds because we\'re in full screen');
        return;
    }

    // Maximize or minimize, if the second argument is present
    var willBeMaximized;
    if (maximize === true) {
        if (!windows.main.isMaximized()) {
            console.log('setBounds: maximizing');
            windows.main.maximize();
        }
        willBeMaximized = true
    } else if (maximize === false) {
        if (windows.main.isMaximized()) {
            console.log('setBounds: unmaximizing');
            windows.main.unmaximize();
        }
        willBeMaximized = false;
    } else {
        willBeMaximized = windows.main.isMaximized();
    }

    // Assuming we're not maximized or maximizing, set the window size
    if (!willBeMaximized) {
        console.log('setBounds: setting bounds to ' + JSON.stringify(bounds));
        windows.main.setBounds(bounds, true);
    } else {
        console.log('setBounds: not setting bounds because of window maximization');
    }
}

function setAspectRatio(aspectRatio, extraSize) {
    console.log('setAspectRatio %o %o', aspectRatio, extraSize);
    if (windows.main) {
        windows.main.setAspectRatio(aspectRatio, extraSize);
    }
}

// Show progress bar. Valid range is [0, 1]. Remove when < 0; indeterminate when > 1.
function setProgress(progress) {
    console.log('setProgress %s', progress);
    if (windows.main) {
        windows.main.setProgressBar(progress);
    }
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

function onCreateNotiWindow(event, content) {
    console.log('create notify window ' + content);
    windows.createNotiWindow(content);
    setTimeout(function () {
     windows.focusWindow(windows.noti);
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

function onMinimize(e,winid)
{
    console.log(winid+ ' Min');
    var win  = BrowserWindow.fromId(winid);
    if(win.isMinimized())
        return;

    win.minimize();
}

function onMaxmize(e,winid)
{
    console.log(winid+ ' Max');
    var win  = BrowserWindow.fromId(winid);
    if(win.isMaximized())
        win.unmaximize();
    else
        win.maximize();
}

function onClose(e,winid)
{
    console.log(winid+ ' Close');
    var win= BrowserWindow.fromId(winid);
    win.close();
}