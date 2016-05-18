module.exports = {
    init,
    onToggleFullScreen,
    onWindowHide,
    onWindowShow,
    toggleFullScreen
};

var electron = require('electron');

var app = electron.app;

var config = require('../config');
var log = require('./log');
var windows = require('./windows');
var locale = require("../static/lang.json");

var appMenu;
var lang;
function init() {
    appMenu = electron.Menu.buildFromTemplate(getAppMenuTemplate());
    electron.Menu.setApplicationMenu(appMenu);

    //dockMenu = electron.Menu.buildFromTemplate(getDockMenuTemplate())
    //if (app.dock) app.dock.setMenu(dockMenu)
}

function toggleReload(){
    log('toggleReload');
    if (windows.main) {
        windows.main.reload();
    }
}

function toggleFullScreen(flag) {
    log('toggleFullScreen %s', flag);
    if (windows.main && windows.main.isVisible()) {
        flag = flag != null ? flag : !windows.main.isFullScreen();
        windows.main.setFullScreen(flag)
    }
}

// Sets whether the window should always show on top of other windows
function toggleFloatOnTop(flag) {
    log('toggleFloatOnTop %s', flag);
    if (windows.main) {
        flag = flag != null ? flag : !windows.main.isAlwaysOnTop();
        windows.main.setAlwaysOnTop(flag);
        getMenuItem(locale[lang].menu.top).checked = flag
    }
}

function toggleDevTools() {
    log('toggleDevTools');
    if (windows.main) {
        windows.main.toggleDevTools();
    }
}

function onWindowShow() {
    log('onWindowShow');
    getMenuItem(locale[lang].menu.full).enabled = true;
    getMenuItem(locale[lang].menu.top).enabled = true
}

function onWindowHide() {
    log('onWindowHide');
    getMenuItem(locale[lang].menu.full).enabled = false;
    getMenuItem(locale[lang].menu.top).enabled = false
}

function onToggleFullScreen(isFullScreen) {
    isFullScreen = isFullScreen != null ? isFullScreen : windows.main.isFullScreen();
    windows.main.setMenuBarVisibility(!isFullScreen);
    getMenuItem(locale[lang].menu.full).checked = isFullScreen;
    windows.main.send('fullscreenChanged', isFullScreen)
}

function getMenuItem(label) {
    for (var i = 0; i < appMenu.items.length; i++) {
        var menuItem = appMenu.items[i].submenu.items.find(function (item) {
            return item.label === label;
        });
        if (menuItem) return menuItem;
    }
}

function getAppMenuTemplate() {
    lang = global.sharedObj.setts['lang'];
    var fileMenu = [
        {
            label: locale[lang].menu.setting,
            accelerator: 'CmdOrCtrl+S',
            click: windows.createSetWindow
        },
        {
            type: 'separator'
        },
        {
            label: locale[lang].menu.minimize,
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        },
        {
            label: locale[lang].menu.close,
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        }
    ];

    var template = [
        {
            label: locale[lang].menu.file,
            submenu: fileMenu
        },
        {
            label: locale[lang].menu.view,
            submenu: [
                {
                    label: locale[lang].menu.reload,
                    accelerator: 'CmdOrCtrl+R',
                    click: () => toggleReload()
                },
                {
                    label: locale[lang].menu.full,
                    type: 'checkbox',
                    accelerator: process.platform === 'darwin'
                        ? 'Ctrl+Command+F'
                        : 'F11',
                    click: () => toggleFullScreen()
                },
                {
                    type: 'separator'
                },
                {
                    label: locale[lang].menu.top,
                    type: 'checkbox',
                    click: () => toggleFloatOnTop()
                },
                {
                    type: 'separator'
                },
                {
                    label: locale[lang].menu.develop,
                    accelerator: process.platform === 'darwin'
                        ? 'Alt+Command+I'
                        : 'Ctrl+Shift+I',
                    click: toggleDevTools

                }
            ]
        },
        {
            label: locale[lang].menu.help,
            role: 'help',
            submenu: [
                {
                    label: locale[lang].menu.learn + config.APP_NAME,
                    click: () => electron.shell.openExternal(config.INC_URL)
                },
                {
                    type: 'separator'
                },
                {
                    label: locale[lang].menu.bug,
                    click: () => electron.shell.openExternal(config.ISSUE_URL )
                },
                {
                    type: 'separator'
                },
                {
                    label: locale[lang].menu.about + config.APP_NAME,
                    click: windows.createAboutWindow
                }

            ]
        }
    ];
    return template;
}

