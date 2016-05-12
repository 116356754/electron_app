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
//var configStore = require('./user-config');

var appMenu;

function init() {
    appMenu = electron.Menu.buildFromTemplate(getAppMenuTemplate());
    electron.Menu.setApplicationMenu(appMenu);

    //dockMenu = electron.Menu.buildFromTemplate(getDockMenuTemplate())
    //if (app.dock) app.dock.setMenu(dockMenu)
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
        getMenuItem('Float on Top').checked = flag
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
    getMenuItem('Full Screen').enabled = true;
    getMenuItem('Float on Top').enabled = true
}

function onWindowHide() {
    log('onWindowHide');
    getMenuItem('Full Screen').enabled = false;
    getMenuItem('Float on Top').enabled = false
}


function onToggleFullScreen(isFullScreen) {
    isFullScreen = isFullScreen != null ? isFullScreen : windows.main.isFullScreen();
    windows.main.setMenuBarVisibility(!isFullScreen);
    getMenuItem('Full Screen').checked = isFullScreen;
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
    var fileMenu = [
        {
            label: 'Setting',
            accelerator: 'CmdOrCtrl+S',
            click: windows.createSetWindow
        },
        {
            label: process.platform === 'windows' ? 'Close' : 'Close Window',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        }
    ];

    var template = [
        {
            label: 'File',
            submenu: fileMenu
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Full Screen',
                    type: 'checkbox',
                    accelerator: process.platform === 'darwin'
                        ? 'Ctrl+Command+F'
                        : 'F11',
                    click: () => toggleFullScreen()
                },
                {
                    label: 'Float on Top',
                    type: 'checkbox',
                    click: () => toggleFloatOnTop()
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Developer',
                    submenu: [
                        {
                            label: 'Developer Tools',
                            accelerator: process.platform === 'darwin'
                                ? 'Alt+Command+I'
                                : 'Ctrl+Shift+I',
                            click: toggleDevTools
                        }
                    ]
                }
            ]
        },
        {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                }
                // ,{
                //    type: 'separator'
                //},
                //{
                //    label: 'Minimize to tray',
                //    type: 'checkbox',
                //    checked: configStore.get('minimizeToTray'),
                //    click(item) {
                //        configStore.set('minimizeToTray', item.checked);
                //    }
                //},
                //{
                //    label: 'Close to tray',
                //    type: 'checkbox',
                //    checked: configStore.get('closeToTray'),
                //    click(item) {
                //        configStore.set('closeToTray', item.checked);
                //    }
                //}

            ]
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Learn more about ' + config.APP_NAME,
                    click: () => electron.shell.openExternal(config.INC_URL)
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Report an Issue...',
                    click: () => electron.shell.openExternal(config.ISSUE_URL + '/issues')
                },
                {
                    type: 'separator'
                },
                {
                    label: 'About ' + config.APP_NAME,
                    click: windows.createAboutWindow
                }

            ]
        }
    ];
    return template;
}

