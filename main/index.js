var electron = require('electron');

var app = electron.app;
var ipcMain = electron.ipcMain;

var autoUpdater = require('./auto-update');

var config = require('../config');
var crashReporter = require('../crash-reporter');
var ipc = require('./ipc');
var log = require('./log');
var menu = require('./menu');
var shortcuts = require('./shortcuts');
var windows = require('./windows');
var tray = require('./tray');

app.commandLine.appendSwitch('register-pepper-plugins', config.PLUGINS_PATH+'/hello_nacl.dll;application/x-ppapi-hello');

//测试chrome浏览器设置代理服务器，然后通过代理访问的url
//chrome proxy setting
//WINDOW_MAIN: 'http://1212.ip138.com/ic.asp',
//app.commandLine.appendSwitch('proxy-server','101.226.249.237:80');

//全局共享数据测试，将数据存在主进程的某个全局变量中，然后在多个渲染进程中使用 remote 模块来访问它
//share object in render process and main process
global.sharedObj = {count: ''};

var shouldQuit = false;
if (!shouldQuit) {
    // Prevent multiple instances of app from running at same time. New instances signal
    // this instance and quit.
    shouldQuit = app.makeSingleInstance(onAppOpen);

    // 这个实例是多余的实例，需要退出
    if (shouldQuit) {
        app.quit();
    }
}

if (!shouldQuit) {
    init();
}

function init() {
    app.ipcReady = false; // main window has finished loading and IPC is ready
    app.isQuitting = false;

    ipc.init();
    app.on('will-finish-launching', function (e) {
        log('will-finish-launching');
        //crashReporter.init()
        autoUpdater.init(function(result)
        {
            if ((result == 2) || (result == 3))//更新过程中任何错误都忽略，并创建启动窗口
                return app.quit();
        });

        //createWindow();
    });

    app.on('ready', function () {
        log('ready');
        menu.init();
        windows.createMainWindow();
        shortcuts.init();
        tray.init();
    });

    app.on('ipcReady', function () {
        //log('Command line args:', argv)
        //processArgv(argv)
        log('ipcReady');
        //broadCastWSInfo();
    });

    //测试通讯在主进程，然后通过ipc发送给所有窗口
    // var broadCastWSInfo =function()
    // {
    //     var ws = require('../common/websocket.js');
    //     var ws_cli = new ws('localhost', 8088);

    //     ws_cli.ws_connect();
    //     ws_cli.ws_.on('message', function (data) {
    //         log(data.toString());
    //         electron.BrowserWindow.getAllWindows().forEach(wins => {
    //             wins.send('wt-msg',data);
    //         });
    //     });

    //     setTimeout(function () {
    //         ws_cli.ws_stop();
    //     }, 1000 * 100);
    // };

    app.on('before-quit', function (e) {
        if (app.isQuitting) return;

        app.isQuitting = true;
        e.preventDefault();
        windows.main.send('dispatch', 'saveState');
        /* try to save state on exit */
        ipcMain.once('savedState', () => app.quit());

        setTimeout(() => app.quit(), 1000);
        /* quit after 1 secs, at most */
    });
}

// 当另一个实例运行的时候，这里将会被调用，我们需要激活应用的窗口
function onAppOpen(newArgv) {
    //newArgv = sliceArgv(newArgv)

    if (app.ipcReady) {
        log('Second app instance opened, but was prevented:', newArgv);
        windows.focusWindow(windows.main);
    }
    else {
        setTimeout(function () {
            windows.focusWindow(windows.main);
        }, 100);
    }
}

