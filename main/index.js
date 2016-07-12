var path =require('path');

var electron = require('electron');
var app = electron.app;
var dialog = electron.dialog;
var ipcMain = electron.ipcMain;

var auto = require('elupdater');
var logger = require('ellog');

var config = require('../config');
var crashReporter = require('../crash-reporter');
var ipc = require('./ipc');
var menu = require('./menu');
var shortcuts = require('./shortcuts');
var windows = require('./windows');
var tray = require('./tray');
var setting = require("./../common/userset");
var ws =require('./ws');

logger.info('====================================');

logger.info('PPAPI注册的文件夹路径为:%s',config.PPAPI_PATH);
app.commandLine.appendSwitch('register-pepper-plugins', config.PPAPI_PATH + '/hello_nacl.dll;application/x-ppapi-hello');

//测试chrome浏览器设置代理服务器，然后通过代理访问的url
//chrome proxy setting
//WINDOW_MAIN: 'http://1212.ip138.com/ic.asp',
//app.commandLine.appendSwitch('proxy-server','101.226.249.237:80');

//全局共享数据测试，将数据存在主进程的某个全局变量中，然后在多个渲染进程中使用 remote 模块来访问它
//share object in render process and main process
global.sharedObj = { setts: {},wsObserver:{}};

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

function createMain()
{
    menu.init();
    windows.createMainWindow();
    shortcuts.init();
    tray.init();

    //连接远程websocket
    //ws.init();
}

function init() {
    app.ipcReady = false; // main window has finished loading and IPC is ready
    app.isQuitting = false;

    global.sharedObj.setts = setting.init();//加载用户配置
    logger.info('用户的设置为:%s',JSON.stringify(global.sharedObj.setts));

    ipc.init();

    logger.info(path.join(process.cwd(),"resources",'app.asar'));
    app.on('will-finish-launching', function () {
        logger.info('app的will-finish-launching事件被触发');
        //crashReporter.init()
        logger.info('自动更新的远程服务端URL为:%s',config.AUTO_UPDATE_URL);
        logger.info('自动更新的自身主框架版本为:%s',process.versions.electron);
        logger.info('自动更新的自身app版本为:%s',app.getVersion());
        auto.setFeedURL({
            updateURL:config.AUTO_UPDATE_URL,
            frameVer:process.versions.electron,
            appVer:app.getVersion(),
            downloadPath:app.getPath('downloads')
        });
        logger.info('自动更新:开始检查更新');
        auto.checkForUpdates();
        //logger.info('自动更新将在%s毫秒后开始检查更新',config.AUTO_UPDATE_CHECK_STARTUP_DELAY);
        //setTimeout(()=>auto.checkForUpdates(), config.AUTO_UPDATE_CHECK_STARTUP_DELAY);
    });

    auto.on('update-error',(err)=>{
        logger.error('自动更新期间出现错;%s',err);
        createMain();
    });

    //auto.on('checking-for-update',()=>logger('checking-for-update'));
    auto.on('update-available',(isframe,version,downloadurl,originMd5)=>{
        var tips = isframe ? '主框架' : '资源包';
        logger.info(tips+'有可用的更新，更新版本为:%s,更新地址为%s,更新程序MD5值为%s',version,downloadurl,originMd5);
        //windows.main.hide();
    });

    //当没有更新的时候校验框架和app的哈希值
    auto.on('update-not-available',()=> {
        logger.info('没有可用的应用更新');
        createMain();
    });

    auto.on('update-user-cancel',()=> {
        logger.info('用户取消更新');
        createMain();
    });

    //安装更新程序
    auto.on('update-downloaded',(localpath)=>{
        logger.info('更新程序已经下载完成,下载路径为%s',localpath);
        setTimeout(()=> {
            logger.info('本应用程序退出,更新程序即将安装');
            auto.quitAndInstall(localpath);
            return app.quit();
        },1000);
    });

    app.on('ready', function () {
        logger.info('Electron完成初始化,app的ready事件被触发');
    });

    app.on('ipcReady', function () {
        logger.info('主窗口建立IPC通讯完成');
    });

    app.on('before-quit', function (e) {
        logger.info('应用程序开始关闭，app的before-quit事件被触发');
        if (app.isQuitting) return;

        app.isQuitting = true;
        e.preventDefault();
        if( windows.main) {
            windows.main.send('dispatch', 'saveState');
            /* try to save state on exit */
            ipcMain.once('savedState', () => app.quit());

            setTimeout(() => app.quit(), 2000);      /* quit after 2 secs, at most */
        }
        else
            app.quit();
    });

    app.on('quit',(event,exitCode )=>{
        logger.info('程序正在退出，退出代码为%d',exitCode);
    })
}

// 当另一个实例运行的时候，这里将会被调用，我们需要激活应用的窗口
function onAppOpen() {
    //newArgv = sliceArgv(newArgv)
    if (app.ipcReady) {
        //logger.info('Second app instance opened, but was prevented:', newArgv);
        logger.info('第二个应用程序被打开,但是被阻止');
        windows.focusWindow(windows.main);
    }
    else {
        setTimeout(function () {
            windows.focusWindow(windows.main);
        }, 100);
    }
}