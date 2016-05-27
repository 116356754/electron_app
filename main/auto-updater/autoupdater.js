/**
 * Created by Administrator on 2016/5/20.
 */
'use strict'

//const app = require('electron').app;
const EventEmitter = require('events').EventEmitter;
var fs = require('fs');
const spawn = require('child_process').spawn;
const updatewin = require('./update-internal');
const util = require('util');
const notifier = require('./updateNotifier');
const electron =require('electron');
const dialog = electron.dialog;
/*五个事件
 事件：'error'
 当更新发生错误的时候触发。

 事件：'checking-for-update'
 当开始检查更新的时候触发。

 事件：'update-available'
 当发现一个可用更新的时候触发，更新包下载会自动开始。

 事件：'update-not-available'
 当没有可用更新的时候触发。

 事件：'update-downloaded'
 在更新下载完成的时候触发。
 */
function AutoUpdater() {
    EventEmitter.call(this)
}

util.inherits(AutoUpdater, EventEmitter);

//1：设置更新的url地址和主框架版本号以及app版本号
AutoUpdater.prototype.setFeedURL = function (updateInfo) {
    this.updateURL = updateInfo.updateURL;
    this.frameVer = updateInfo.frameVer;
    this.appVer = updateInfo.appVer;
    this.downloadPath = updateInfo.downloadPath;
};

AutoUpdater.prototype.checkForUpdates = function () {
    if (!this.updateURL) {
        return this.emitError('Update URL is not set')
    }

    this.emit('checking-for-update');
    updatewin.checkVersion({
        updateURL: this.updateURL,
        frameVer: this.frameVer,
        appVer: this.appVer
    }, (error, update) => {
        if (error != null) {
            return this.emitError(error)
        }
        if (update.neeedUpdate == false) {
            return this.emit('update-not-available', update.frameMD5, update.appMD5);
        }
        var index = dialog.showMessageBox({
            type: "none",
            title: 'update available',
            message: 'Do you want to update application?',
            buttons: ['Yes Now','Next Time']
        });
        if (index == 1)
            return this.emitError("user don't want to update now");

        this.emit('update-available', update.version, update.downloadurl);

        notifier.createUpdateNotifier(update.version);
        notifier.updateNofierResult('Update application downloading...');
        updatewin.download(update.downloadurl, this.downloadPath, (error, exepath)=> {
            if (error != null)
                return this.emitError(error);
            notifier.updateNofierResult('update downloaded! we will install update app');

            setTimeout(()=>{
                this.emit('update-downloaded', exepath);
            },5000);
        });
    })
};

AutoUpdater.prototype.quitAndInstall = function (exepath) {
    //squirrelUpdate.processStart()
    notifier.closeUpdateNotifier();

    console.log(exepath);

    //启动更新程序程序，退出安装
    if (!fs.existsSync(exepath)) {
        console.log('update exe is not exist!');
        return this.emitError('update exe is not exist!');
    }
    var error, spawnedProcess;
    try {
        spawnedProcess = spawn(exepath, [], {
            detached: true,
            stdio: ['ignore', 'ignore', 'ignore']
        });
        spawnedProcess.unref();
    } catch (error1) {
        error = error1;
        return this.emitError(error);
    }
};

// Private: Emit both error object and message, this is to keep compatibility
// with Old APIs.
AutoUpdater.prototype.emitError = function (message) {
    notifier.updateError(message);
    setTimeout(()=>{
        notifier.closeUpdateNotifier();
    },5000);
    return this.emit('error', new Error(message), message)
};

module.exports = new AutoUpdater();