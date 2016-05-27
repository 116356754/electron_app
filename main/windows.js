var windows = module.exports = {
    about: null,
    main: null,
    other: null,
    tearout: null,
    set:null,
    updateNotifier : null,
    createAboutWindow,
    createMainWindow,
    createOtherWindow,
    createTearoutWindow,
    createSetWindow,
    createUpdateNotifier,
    focusWindow
};

var electron = require('electron');
var log = require('./../common/logger');
var config = require('../config');
var configStore = require('./userset');
var path =require('path');
var menu = require('./menu');
var fs = require('fs');
var windowStateKeeper = require('electron-window-state');

function createAboutWindow() {
    if (windows.about) {
        return focusWindow(windows.about)
    }
    var win = windows.about = new electron.BrowserWindow({
        //backgroundColor: '#ECECEC',
        show: false,
        center: true,
        resizable: false,
        icon: config.APP_ICON + '.png',
        title: process.platform !== 'darwin'
            ? 'About ' + config.APP_WINDOW_TITLE
            : '',
        useContentSize: true, // Specify web page size without OS chrome
        width: 300,
        height: 170,
        minimizable: false,
        maximizable: false,
        fullscreen: false,
        skipTaskbar: true
    });

    win.loadURL(config.WINDOW_ABOUT);

    // No window menu
    win.setMenu(null);
    console.log('about windows id is:' + win.id);

    win.webContents.on('did-finish-load', function () {
        win.show()
    });

    win.once('closed', function () {
        windows.about = null;
    })
}

function createMainWindow() {
    if (windows.main) {
        return focusWindow(windows.main)
    }

    const mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800
    });

    var win = windows.main = new electron.BrowserWindow({
        backgroundColor: '#FFF',
        darkTheme: true, // Forces dark theme (GTK+3)
        icon: config.APP_ICON + '.png',
        minWidth: 425,
        minHeight: 38 + (120 * 2), // header height + 2 torrents
        show: false, // Hide window until DOM finishes loading
        title: config.APP_WINDOW_TITLE,
        titleBarStyle: 'hidden-inset', // Hide OS chrome, except traffic light buttons (OS X)
        useContentSize: true, // Specify web page size without OS chrome
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,

        //width: 1000,
        //height: 800,
        webPreferences: {
            plugins: true
        },
        frame:config.HAVE_FRAME
    });

    mainWindowState.manage(win);

    win.loadURL(config.WINDOW_MAIN);

    console.log('main windows hwnd is:' + win.getNativeWindowHandle().reverse().toString('hex'));
    console.log('other windows id is:' + win.id);

    win.webContents.on('dom-ready', function () {
        menu.onToggleFullScreen()
    });

    win.on('blur', menu.onWindowHide);
    win.on('focus', menu.onWindowShow);

    win.on('enter-full-screen', () => menu.onToggleFullScreen(true));
    win.on('leave-full-screen', () => menu.onToggleFullScreen(false));

    win.on('close', function (e) {
        if (!electron.app.isQuitting) {
            e.preventDefault();
            win.send('dispatch', 'pause');
            win.hide();
        }

        var setts = global.sharedObj.setts;
        console.log(setts['closeToTray']);
        if (!setts['closeToTray']) {
            setTimeout(() => electron.app.quit(), 1000);
        }
    });

    win.on('minimize', () => {
        var setts = global.sharedObj.setts;
        console.log(setts['minimizeToTray']);
        if (setts['minimizeToTray']) {
            win.hide();
        }
    });

    win.on('closed', function () {
        windows.main = null;
    })
}

function createOtherWindow(url) {
    if (windows.other) {
        return focusWindow(windows.other)
    }
    var win = windows.other = new electron.BrowserWindow({
        //backgroundColor: '#ECECEC',
        show: false,
        center: true,
        resizable: false,
        icon: config.APP_ICON + '.png',
        title: config.APP_WINDOW_TITLE + '-other',
        useContentSize: true, // Specify web page size without OS chrome
        width: 600,
        height: 480,
        minimizable: false,
        maximizable: false,
        fullscreen: false,
        skipTaskbar: false
    });
    win.loadURL(url);

    // No window menu
    win.setMenu(null);

    console.log('other windows id is:' + win.id);

    win.webContents.on('did-finish-load', function () {
        win.show()
    });

    win.once('closed', function () {
        windows.other = null;
    })
};


function createTearoutWindow(url, dom) {
    "use strict";
    if (windows.tearout) {
        return focusWindow(windows.tearout)
    }

    var win = windows.tearout = new electron.BrowserWindow({
        //backgroundColor: '#ECECEC',
        show: false,
        center: true,
        resizable: false,
        icon: config.APP_ICON + '.png',
        title: config.APP_WINDOW_TITLE + '-tearout' + Math.random(),
        useContentSize: true, // Specify web page size without OS chrome
        minimizable: false,
        maximizable: false,
        width: 230,
        height: 210,
        fullscreen: false,
        skipTaskbar: false
    });
    win.parentwnd = windows.main;

    win.loadURL(url);

    // No window menu
    win.setMenu(null);

    console.log('tearout windows id is:' + win.id);
    console.log('tearout windows hwnd is:' + win.getNativeWindowHandle().reverse().toString('hex'));
    win.webContents.on('did-finish-load', function () {
        win.show();
        //win.toggleDevTools();
    });

    win.webContents.on('dom-ready', function () {
        //execute js
        var jscode = "var div = document.createElement('div');document.body.appendChild(div);div.outerHTML =" + dom;
        //console.log(jscode);
        win.webContents.executeJavaScript(jscode);

        //insert js
        jscode='var script = document.createElement("script");script.src = "./tearout.js";'+'document.body.appendChild(script);';
        console.log(jscode);
        win.webContents.executeJavaScript(jscode);

        //insert css
        console.log(config.TEAROUT_CSS);
        var tearout_css = fs.readFileSync(config.TEAROUT_CSS).toString();
        win.webContents.insertCSS(tearout_css);
    });

    win.on('tear_close',function(result){
        log(result);
    });

    win.once('closed', function () {
        win = null;
        windows.tearout = null;
        //show sub dom
        windows.main.webContents.executeJavaScript("document.getElementById('tearout-container').style.display=''");
    });
}

function createSetWindow() {
    if (windows.set) {
        return focusWindow(windows.set)
    }
    var win = windows.set = new electron.BrowserWindow({
        //backgroundColor: '#ECECEC',
        show: false,
        center: true,
        resizable: false,
        icon: config.APP_ICON + '.png',
        title: config.APP_WINDOW_TITLE+' Settings' ,
        useContentSize: true, // Specify web page size without OS chrome
        width: 500,
        height: 550,
        minimizable: false,
        maximizable: false,
        fullscreen: false,
        skipTaskbar: false,
        frame:config.HAVE_FRAME
    });

    win.loadURL(config.WINDOW_SET);

    // No window menu
    win.setMenu(null);
    console.log('about windows id is:' + win.id);

    win.webContents.on('did-finish-load', function () {
        win.show();
        //win.toggleDevTools();
    });

    win.once('closed', function () {
        windows.set = null;

        console.log(JSON.stringify(global.sharedObj.setts));
        configStore.save(global.sharedObj.setts);
    })
}
function createUpdateNotifier(content)
{
    if (windows.updateNotifier) {
        return focusWindow(windows.updateNotifier)
    }

    var win =windows.updateNotifier= new electron.BrowserWindow({ width: 400, height: 200 ,
        backgroundColor: '#FFFFFF',
        alwaysOnTop:true,
        autoHideMenuBar:true,
        resizable:false,
        useContentSize: true, // Specify web page size without OS chrome
        frame:false,
        skipTaskbar:true
    });

    win.loadURL(path.join(config.MAIN_PATH,'auto-updater','Assets','update.html'));

    var code ="var nameElement = document.getElementById('name');nameElement.innerHTML='"+content+"'";
    //alert(code);
    win.webContents.executeJavaScript(code);

    win.on('closed', function() {
        win = null;
        windows.updateNotifier = null;
    });

    var Positioner = require('electron-positioner');
    var positioner = new Positioner(win);

    // Moves the window top right on the screen.
    positioner.move('center');
}

function focusWindow(win) {
    if (win.isMinimized()) {
        win.restore();
    }
    win.show();// shows and gives focus
}
