var electron = require('electron');

var app = electron.app;
var ipcMain = electron.ipcMain;

//var autoUpdater = require('./auto-update');

var config = require('../config');
var crashReporter = require('../crash-reporter');
var ipc = require('./ipc');
var log = require('./log');
var menu = require('./menu');
var shortcuts = require('./shortcuts');
var windows = require('./windows');
var tray = require('./tray');
var setting = require("./usersetting");
//var appcheck = require('./checksum');
var cp = require('child_process');
var dialog = electron.dialog;
var auto = require('./auto-updater/autoupdater');
var path =require('path');

log(config.PPAPI_PATH);
app.commandLine.appendSwitch('register-pepper-plugins', config.PPAPI_PATH + '/hello_nacl.dll;application/x-ppapi-hello');

//测试chrome浏览器设置代理服务器，然后通过代理访问的url
//chrome proxy setting
//WINDOW_MAIN: 'http://1212.ip138.com/ic.asp',
//app.commandLine.appendSwitch('proxy-server','101.226.249.237:80');

//全局共享数据测试，将数据存在主进程的某个全局变量中，然后在多个渲染进程中使用 remote 模块来访问它
//share object in render process and main process
global.sharedObj = {count: '', setts: {}};

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

    global.sharedObj.setts = setting.init();//加载配置
    console.log(JSON.stringify(global.sharedObj.setts));
    ipc.init();
    log(path.join(process.cwd(),"resources",'app.asar'));
    app.on('will-finish-launching', function (e) {
        log('will-finish-launching');
        //crashReporter.init()
        auto.setFeedURL({
            updateURL:config.AUTO_UPDATE_URL,
            frameVer:process.versions.electron,
            appVer:app.getVersion(),
            downloadPath:app.getPath('downloads')
        });
        //createWindow();
        setTimeout(()=>auto.checkForUpdates(), config.AUTO_UPDATE_CHECK_STARTUP_DELAY);
    });

    auto.on('error',(err)=>console.log(err));
    //auto.on('checking-for-update',()=>console.log('checking-for-update'));
    auto.on('update-available',(version,downloadurl)=>console.log('update-available'+version,downloadurl));

    //当没有更新的时候校验框架和app的哈希值
    auto.on('update-not-available',(frameMD5,appMD5)=>{
        console.log('update-not-available '+frameMD5+appMD5);
        var child = cp.fork(config.MAIN_PATH+'/checksum/forkChild.js');

        //发送文件路径
        child.send({frameSum:frameMD5,appSum:appMD5,
            exepath:process.execPath,
            dirpath:path.join(process.cwd(),"resources",'app.asar')
        });

        //收到哈希的结果
        child.on('message', function(m) {
            console.log('hash result is :'+m.result);
            child.kill('SIGTERM');
            if(!m.result)
            {
                console.log('check app or frame is not validate!');
                var index = dialog.showMessageBox({
                    type: "none",
                    title: 'checksum is not correct',
                    message: 'your Titan application checksum is not correct, should reinstall application later!',
                    buttons: ['OK']
                });
                if (index == 0)
                   return app.quit();
            }
            else
                console.log('check app and frame is validate!');
        });
    });

    //安装更新程序
    auto.on('update-downloaded',(localpath)=>{
        console.log('update-downloaded'+localpath);

        setTimeout(()=> {
            auto.quitAndInstall(localpath);
            return app.quit();
        },1000);
    });

    app.on('ready', function () {
        log('ready');
        menu.init();
        windows.createMainWindow();
        shortcuts.init();
        tray.init();
    });

    app.on('ipcReady', function () {
        var Toaster = require('electron-toaster');
        var toaster = new Toaster();
        toaster.init(windows.main);
        //log('Command line args:', argv)
        //processArgv(argv)
        log('ipcReady');
        //broadCastWSInfo();
    });

    app.on('before-quit', function (e) {
        if (app.isQuitting) return;

        app.isQuitting = true;
        e.preventDefault();
        windows.main.send('dispatch', 'saveState');
        /* try to save state on exit */
        ipcMain.once('savedState', () => app.quit());

        setTimeout(() => app.quit(), 2000);
        /* quit after 2 secs, at most */
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