module.exports = {
  init
};

var electron = require('electron');
var globalShortcut = electron.globalShortcut;
var localShortcut = require('electron-localshortcut');

var menu = require('./menu');

function init () {
  // ⌘+Shift+F is an alternative fullscreen shortcut to the ones defined in menu.js.
  // Electron does not support multiple accelerators for a single menu item, so this
  // is registered separately here.
  localShortcut.register('CmdOrCtrl+Shift+F', menu.toggleFullScreen)
}