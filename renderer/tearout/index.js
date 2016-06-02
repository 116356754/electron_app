/**
 * Created by Administrator on 2016/6/1.
 */
var electron = require('electron');
var logger = require('ellog');
var path = require('path');
var fs = require('fs');
var BrowserWindow = electron.remote.BrowserWindow;

module.exports = {
    createTearoutWindow
};

var wins=[];

function createTearoutWindow(dom, parentId) {
    "use strict";
    var win = new BrowserWindow({
        //backgroundColor: '#ECECEC',
        show: false,
        center: true,
        resizable: false,
        title: 'tearout',
        useContentSize: true, // Specify web page size without OS chrome
        minimizable: false,
        maximizable: false,
        width: 230,
        height: 240,
        fullscreen: false,
        skipTaskbar: true,
        alwaysOnTop:true,
        webPreferences: {
            preload: require.resolve('elbarpreload')
        },
        frame:false
    });
    win.loadURL(path.join(__dirname, 'index.html'));

    // No window menu
    win.setMenu(null);

    console.log('tearout windows id is:' + win.id);

    win.webContents.on('did-finish-load', function () {
        win.show();
        //win.toggleDevTools();
        win.send('init', parentId);//设置父窗体的id
    });

    win.webContents.on('dom-ready', function () {
        //execute js
        var jscode = "var div = document.createElement('div');document.body.appendChild(div);div.outerHTML =" + dom;
        //console.log(jscode);
        win.webContents.executeJavaScript(jscode);

        //insert js
        //jscode = 'var script = document.createElement("script");script.src = "./tearout.js";' + 'document.body.appendChild(script);';
        //console.log(jscode);
        //win.webContents.executeJavaScript(jscode);
        //
        ////insert css
        //var tearout_css = fs.readFileSync(path.join(__dirname, 'tearout.css')).toString();
        //win.webContents.insertCSS(tearout_css);
    });

    win.on('tear_close', function (result) {
        console.log('tear_close');
    });

    wins.push(win.id);

    //父窗口关闭前，将所有的子窗口首先关闭吊
    BrowserWindow.fromId(parseInt(parentId)).on('close',function(){
        logger.info('tearout window count is '+wins.length);
        if(wins.length==0) return;

        for (let i = 0; i < wins.length; i++)
        {
            let intid=wins.pop();
            logger.info('tearout window id :'+ intid+' will close');
            logger.info(remote.BrowserWindow.fromId(intid).getTitle());
            BrowserWindow.fromId(intid).close();
        }
    });

    return win.id;
}