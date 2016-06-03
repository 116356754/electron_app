module.exports = {
    init
};

var electron = require('electron');
var app = electron.app;
var ipcMain = electron.ipcMain;
var powerSaveBlocker = electron.powerSaveBlocker;
var BrowserWindow = electron.BrowserWindow;

var logger = require('ellog');

var menu = require('./menu');
var windows = require('./windows');

// has to be a number, not a boolean, and undefined throws an error
var powerSaveBlockID = 0;

function init() {
    logger.info('初始化主进程的IPC通讯接口,监听消息');

    ipcMain.on('ipcReady', function () {
        app.ipcReady = true;
        app.emit('ipcReady');
        windows.main.show();
        console.timeEnd('init');
    });

    ipcMain.on('toggleFullScreen', function (e, flag) {
        menu.toggleFullScreen(flag)
    });

    var oldEmit = ipcMain.emit;
    ipcMain.emit = function (name, e, target, ...args) {
        // Relay messages between the main window and the WebTorrent hidden window
        if (name.startsWith('wt-')) {
            var sourceTitle  = e.sender.browserWindowOptions.title;
            logger.info('发现消息的窗口title为%s',sourceTitle);
            BrowserWindow.getAllWindows().forEach(wins => {
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
        logger.info('网络状态发生变化%s',status);
        /*if(!status)
         setTimeout(() => app.quit(), 1000) ;/!* quit after 2 secs, at most *!/*/
         //if(!status)
         //   windows.main.setOverlayIcon(nativeImage.createFromPath(iconPath('dot.png')), total + ' items');
    });
}