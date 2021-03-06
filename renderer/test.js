var config = require('../config');
var path =require('path');

var logger = require('ellog');

var ver = require(path.join(config.COMM_PATH,'version'));
var net_state = require('./../network/networkStatus.js');

var remote = require('electron').remote;
var electron = require('electron');
var ipcRenderer = electron.ipcRenderer;

window.onload = function () {
    document.getElementById("content").innerHTML = JSON.stringify(ver.getProcessVersion());

    document.getElementById("mfversion").innerHTML = JSON.stringify(ver.getElectronVersion());

    document.getElementById("appversion").innerHTML = JSON.stringify(ver.getAppVersion());

    net_state.init();

    ipcRenderer.on('wt-msg', function (e, msg) {
        //alert('main window recv:'+msg);
        console.log('main window recv:' + msg);
        document.getElementById('recwt-msg').value = msg;
    });
};

var notifier = require('elnotifier');
var sound = require('./lib/sound');
var count =1;
var shownoti =function()
{
// Full Options
    count++;
    notifier.notify('Notification', {
        message: 'Event begins in 10 minutes'+count
        //,icon: 'http://cl.ly/J49B/3951818241085781941.png'
        //,buttons: ['close']
    });
    //notifier.on('clicked', () => {
    //    win.close();
    //});
    sound.play('DONE');
};

//node aes
const encry = require('../common/encrypt.js');
var encryptiontxt = function (plaintext) {
    return encry.encryptiontxt(plaintext);
};

var decryptiontxt = function (enctext) {
    return encry.decryptiontxt(enctext);
};

//websocket handle function
ipcRenderer.on('ws-title-message', function (e, data) {
    document.getElementById('ws-message').value += data.toString() + '\n';
});

//listen for websocket message from the main process
var observer = remote.getGlobal('sharedObj').wsObserver;
function setupWSObserver(title) {
    observer.subscribe(remote.getCurrentWebContents(), title, 'ws-title-message');
}

function clearWSObserver(title) {
    observer.unsubscribe(remote.getCurrentWebContents(), title);
}

function clearWSObserverAll()
{
    observer.unsubscribeAll(remote.getCurrentWebContents());
}

//create new window
var createOtherWindow = function () {
    var config = require('../config');

    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;

    var win = new BrowserWindow({
        backgroundColor: '#FFF',
        width: 800, height: 600, frame:false,
        webPreferences: {
            preload: require.resolve('elbarpreload')
        }
    });

    win.loadURL(__dirname+'/other.html');
};

var sendMessage = function (target, content) {
    var ipc = require('electron').ipcRenderer;
    ipc.send('wt-msg', target, content);
};

var sendAllMessage = function (content) {
    var ipc = require('electron').ipcRenderer;
    ipc.send('wt-msg', 'all', content);
};

const saveFiledlg = require('./lib/savefile.js');

var exCSV = function () {
    var jsobjs = [
        {
            Make: 'Nissan',
            Model: 'Murano',
            Year: '2013'
        },
        {
            Make: 'BMW',
            Model: 'X5',
            Year: '2014'
        }
    ];
    saveFiledlg.saveCSVFileAs(jsobjs);
};

function expdf() {
    saveFiledlg.savePDFFileAs();
}

var tearoutWins ={};
var tearout =function(domId)
{
    var tearout =require('./tearout/index');
    var winid =tearout.createTearoutWindow(JSON.stringify(document.getElementById(domId).outerHTML),
        remote.getCurrentWindow().id
    );

    //保存创建的子窗口的id与对应的domid的关系
    tearoutWins[winid] = domId;

    //在父窗口中对该dom元素进行隐藏
    document.getElementById(domId).style.display='none';

    const ipcRenderer = require('electron').ipcRenderer;
    //分离出去的dom元素窗体的关闭时候，恢复父窗体的dom元素，并重新复制上修改后的dom
    ipcRenderer.on('tear_close',function(e,id,msg){
        console.log('main window recv wt-tear_close:' + msg);
        var oldnode = document.getElementById(tearoutWins[id]);
        oldnode.outerHTML =JSON.parse(msg);

        delete  tearoutWins[id];
    });
};

var callcppaddon = function()
{
    "use strict";
    var binding = require('hello');
    console.log('binding.hello() =', binding.hello());
};

function createPlugin() {
    var plugin = document.createElement("embed");
    plugin.setAttribute("id", "explugin");
    plugin.setAttribute("type", "application/x-ppapi-hello");
    plugin.setAttribute("width", "480px");
    plugin.setAttribute("height", "300px");
    plugin.setAttribute("style","border-style: solid;");

    var hwndhex=remote.getCurrentWindow().getNativeWindowHandle().reverse().toString('hex');
    plugin.setAttribute('hwnd',hwndhex);
    //plugin.setAttribute('exe',"E:/ppapi/sub.exe");
    plugin.setAttribute('exe',"C:/windows/system32/mspaint.exe");

    var container = document.getElementById("pluginContainer");
    container.appendChild(plugin);

    //setTimeout(function(){remote.getCurrentWindow().focus();},1000);
}

function deletePlugin() {
    var container = document.getElementById("pluginContainer");
    var plugins = container.getElementsByTagName("embed");
    if (plugins.length >= 1) {
        container.removeChild(plugins[0]);
    }
}

function showpdf(pdfurl){
    //"use strict";
    //console.log(pdfurl);
    var pdfview = require('elpdfview');
    pdfview.showpdf(pdfurl);
}

