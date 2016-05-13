/**
 * Created by Administrator on 2016/4/26.
 */
module.exports={
    showNotification
};

var sound = require('./sound');
var version = require('./version');
var ipcRenderer = require('electron').ipcRenderer;

function html5noti(title,content)
{
     if (window.Notification){
        if(Notification.Permission==='granted'){
            console.log('granted');
            var notification = new Notification(title,{body:content});
             notification.onclick = function () {
                ipcRenderer.send('focusWindow', 'main')
            };
        }else {
            console.log('requestPermission');
            Notification.requestPermission().then(function(result) {
                if (result === 'denied') {
                    console.log('Permission wasn\'t granted. Allow a retry.');
                    return;
                }
                if (result === 'default') {
                    console.log('The permission request was dismissed.');
                    return;
                }
                // Do something with the granted permission.
                var notification = new Notification('Notification title', {
                    //icon: path.join(__dirname, "icon.jpg"),
                    body: "Hey there! You've been notified!",
                });
                console.log("done");
            });
        };
    }else alert('你的浏览器不支持此特性，请下载谷歌浏览器试用该功能');
}

function showNotification(title,content) {
    console.log('show notification');

    var setts = remote.getGlobal('sharedObj').setts;
    var notilang ;
    if(setts['lang']=='en')
        notilang = 'Notification';
    else
        notilang = '通知';

    //if (version.isWin8plusOS())//win 8以上的系统使用html5的提示
    //    html5noti(content);
    //else {
        var ipc = require("electron").ipcRenderer;
        var msg = {
            title: notilang,
            message: title,
            detail: content,
            width: 440,
            // height : 160, window will be autosized
            //timeout: 6000,
            focus: true // set focus back to main window
        };
        ipc.send('electron-toaster-message', msg);
    //}
    sound.play('DONE');
}