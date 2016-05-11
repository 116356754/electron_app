/**
 * Created by Administrator on 2016/4/26.
 */
module.exports={
    showNotification
};

var sound = require('./sound');
var version = require('./version');
var ipcRenderer = require('electron').ipcRenderer;

function html5noti(content)
{
     if (window.Notification){
        if(Notification.Permission==='granted'){
            console.log('granted');
            var notification = new Notification('Notification',{body:content});
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
function showNotification (usenative,content) {
    console.log('show notification');

    if(usenative)
    {
        
        if(version.isWin8plusOS())//win 8以上的系统使用html5的提示        
            html5noti(content);
        
        else                  
            ipcRenderer.send('create-notiwindow',content);        
    }
    else
    {
        //jquery notification
        $.messager.lays(300, 200);
        $.messager.show(0, '<a href="http://www.baidu.com">访问百度</a><br>提示内容：<br>'+content);
    }

    sound.play('DONE');
}