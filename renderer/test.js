var config = require('../config');

var ver = require('./lib/version.js');
var net_state = require('./lib/networkStatus.js');
var nofi = require('./lib/noti.js');

var ws = require('../common/websocket.js');
var wss = require('../common/wss.js');

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


var shownoti = function (title, content) {
    //native window notification or jquery notification
    nofi.showNotification(title, content);
};

//node aes
const encry = require('../common/encrypt.js');
var encryptiontxt = function (plaintext) {
    return encry.encryptiontxt(plaintext);
};

var decryptiontxt = function (enctext) {
    return encry.decryptiontxt(enctext);
};

//md5 file
var path = require('path');
var md5file = function (filename) {
    var filepath = path.join(__dirname, filename);
    console.log(filepath);
    return encry.md5file(filepath);
};

//md5 dir
var md5dir = function () {
    var filepath = __dirname;
    console.log(filepath);
    return encry.md5dir(filepath);
};

//ws_client

var ws_cli;
var ws_connect = function (host, port) {
    ws_cli = new ws(host, port);
    ws_cli.ws_connect();
};

var ws_disconnect = function () {
    ws_cli.ws_stop();
};

var ws_send = function (msg) {
    ws_cli.ws_sendmsg(msg);
};

//wss_client

var wss_cli;
var wss_connect = function (host, port) {
    wss_cli = new wss(host, port);
    wss_cli.wss_connect();
};

var wss_disconnect = function () {
    wss_cli.wss_stop();
};

var wss_send = function (msg) {
    wss_cli.wss_sendmsg(msg);
};

//share object used in render process
var remote = require('electron').remote;
var shareobj_set = function (key, value) {
    remote.getGlobal('sharedObj')[key] = value;
};

var shareobj_get = function (key) {
    var value = remote.getGlobal('sharedObj')[key];
    alert(value);
    return value;
};

//create new window
var createOtherWindow = function () {
    var config = require('../config');
    const ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.send('create-window', config.WINDOW_OTHER);
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
    var win = remote.getCurrentWindow();

    saveFiledlg.savePDFFileAs();
}

var tearout =function()
{
    "use strict";
    console.log(JSON.stringify(document.getElementById('tearout-container').outerHTML));

    var config = require('../config');
    const ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.send('tearout-window', config.WINDOW_TEAROUT,JSON.stringify(document.getElementById('tearout-container').outerHTML));

    document.getElementById('tearout-container').style.display='none';

    //分离出去的dom元素窗体的关闭时候，恢复父窗体的dom元素，并重新复制上修改后的dom
    ipcRenderer.once('wt-tear_close',function(e,msg){
        console.log('main window recv wt-tear_close:' + msg);
        var oldnode = document.getElementById('tearout-container');
        oldnode.outerHTML =JSON.parse(msg);
    })
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

    setTimeout(function(){remote.getCurrentWindow().focus();},1000);
}

function deletePlugin() {
    var container = document.getElementById("pluginContainer");
    var plugins = container.getElementsByTagName("embed");
    if (plugins.length >= 1) {
        container.removeChild(plugins[0]);
    }
}

function showpdf(pdfurl){
    "use strict";
    console.log(pdfurl);
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;

    var win = new BrowserWindow({ width: 800, height: 600 ,
        webPreferences: {
            nodeIntegration: false,
            webSecurity: false
        },
        title: 'PDF Viewer',
        autoHideMenuBar:true
    });

    win.loadURL(config.PDF_PDFURL+pdfurl);

    win.on('closed', function() {
        win = null;
    });
}