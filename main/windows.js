var windows = module.exports = {
    about: null,
    main: null,
    set:null,
    createAboutWindow,
    createMainWindow,
    createSetWindow,
    focusWindow
};

var electron = require('electron');
var logger = require('ellog');
var config = require('../config');
var configStore = require('./../common/userset');
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
        skipTaskbar: true,
        webPreferences: {
            preload:require.resolve('elbarpreload')
        }
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
           // ,nodeIntegration:false
            , preload:require.resolve('elbarpreload')
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
        logger.info('main window will close');
        if (!electron.app.isQuitting) {
            e.preventDefault();
            //win.hide();
        }

        var setts = global.sharedObj.setts;
        console.log(setts['closeToTray']);
        if (!setts['closeToTray']) {
            setTimeout(() => electron.app.quit(), 200);
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
        frame:config.HAVE_FRAME,
        webPreferences: {
            preload:require.resolve('elbarpreload')
        }
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
    if(!win) return;

    if (win.isMinimized()) {
        win.restore();
    }
    win.show();// shows and gives focus
}