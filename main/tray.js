module.exports = {
  init
};

var path = require('path');
var electron = require('electron');
var locale =require("../static/lang.json");

var app = electron.app;
var Menu = electron.Menu;
var Tray = electron.Tray;

var windows = require('./windows');

var trayIcon;

function init () {
  trayIcon = new Tray(path.join(__dirname, '..', 'static', 'TaiTanSmall.png'));

  // On Windows, left click to open the app, right click for context menu
  // On Linux, any click (right or left) opens the context menu
  trayIcon.on('click', showApp);

  // Show the tray context menu, and keep the available commands up to date
  updateTrayMenu();
  windows.main.on('show', updateTrayMenu);
  windows.main.on('hide', updateTrayMenu);
}

function updateTrayMenu () {
  console.log('updateTrayMenu ' +windows.main.isVisible());
  var lang = global.sharedObj.setts['lang'];
  var showHideMenuItem;
  if (windows.main.isVisible()) {
    showHideMenuItem = { label: locale[lang].tray.hide, click: hideApp }
  } else {
    showHideMenuItem = { label: locale[lang].tray.show, click: showApp }
  }
  var contextMenu = Menu.buildFromTemplate([
    showHideMenuItem,
    {label:  locale[lang].settings.title,click:() =>windows.createSetWindow()},
    { label:  locale[lang].tray.quit, click: () => app.quit() }
  ]);
  trayIcon.setContextMenu(contextMenu)
}

function showApp () {
  //windows.main.show();
  electron.BrowserWindow.getAllWindows().forEach(window => {
    window.show(); // or window.show();
  });
}

function hideApp () {
  //windows.main.hide();
  electron.BrowserWindow.getAllWindows().forEach(window => {
    window.hide(); // or window.show();
  });
}
