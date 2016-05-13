var windows = module.exports = {
    about: null,
    main: null,
    other: null,
    noti: null,
    tearout: null,
    set:null,
    createAboutWindow,
    createMainWindow,
    createOtherWindow,
    createNotiWindow,
    createTearoutWindow,
    createSetWindow,
    focusWindow
};

var electron = require('electron');

var config = require('../config');
var configStore = require('./usersetting');

var menu = require('./menu');
var fs = require('fs');
var windowStateKeeper = require('electron-window-state');

function createAboutWindow() {
    if (windows.about) {
        return focusWindow(windows.about)
    }
    var win = windows.about = new electron.BrowserWindow({
        backgroundColor: '#ECECEC',
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
        //backgroundColor: '#1E1E1E',
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
        }
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

var Positioner = require('electron-positioner');
function createNotiWindow(content) {
    if (windows.noti) {
        return focusWindow(windows.noti);
    }
    var win = windows.noti = new electron.BrowserWindow({
        //backgroundColor: '#ECECEC',
        show: false,
        //center: false,
        resizable: false,
        icon: config.APP_ICON + '.png',
        title: config.APP_WINDOW_TITLE + '-noti',
        useContentSize: true, // Specify web page size without OS chrome
        width: 300,
        height: 150,
        minimizable: false,
        maximizable: false,
        fullscreen: false,
        skipTaskbar: true,
        movable: false,
        frame: true
    });
    win.loadURL(config.WINDOW_NOTI);

    // No window menu
    win.setMenu(null);

    console.log('notify windows id is:' + win.id);

    var positioner = new Positioner(win);

    // Moves the window top right on the screen.
    positioner.move('bottomRight');

    win.webContents.on('did-finish-load', function () {
        win.show();
        win.webContents.insertCSS("body{ background-color: #404041; color: #fff;}");
    });

    win.webContents.on('dom-ready', function () {
        var jscode = "document.getElementById('noti-msg').value='" + content + "'";
        console.log(jscode);
        win.webContents.executeJavaScript(jscode);
    });

    //阻止修改通知窗口的标题
    win.on('page-title-updated', function (event) {
        event.preventDefault();
    });

    win.once('closed', function () {
        windows.noti = null;
    });
}

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

        //insert css
        console.log(config.TEAROUT_CSS);
        var tearout_css = fs.readFileSync(config.TEAROUT_CSS).toString();
        win.webContents.insertCSS(tearout_css);
    });

    win.once('closed', function () {
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
        title: process.platform !== 'darwin'
            ? 'About ' + config.APP_WINDOW_TITLE
            : '',
        useContentSize: true, // Specify web page size without OS chrome
        width: 500,
        height: 550,
        minimizable: false,
        maximizable: false,
        fullscreen: false,
        skipTaskbar: false
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

function focusWindow(win) {
    if (win.isMinimized()) {
        win.restore();
    }
    win.show();// shows and gives focus
}
