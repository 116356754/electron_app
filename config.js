var applicationConfigPath = require('application-config-path');
var path = require('path');
var qs = require ("querystring");

var APP_NAME = 'Taitan';
var APP_TEAM = 'The HTML5 Project';
var APP_VERSION = require('./package.json').version;

module.exports = {
  APP_COPYRIGHT: 'Copyright © 2015-2016 ' + APP_TEAM,
  APP_FILE_ICON: path.join(__dirname, 'static', 'TaiTanFile'),
  APP_ICON: path.join(__dirname, 'static', 'TaiTan'),
  APP_OFFLINEICON: path.join(__dirname, 'static', 'TaiTanoff'),
  APP_NAME: APP_NAME,
  APP_TEAM: APP_TEAM,
  APP_VERSION: APP_VERSION,
  APP_WINDOW_TITLE: APP_NAME,

  AUTO_UPDATE_URL: 'http://127.0.0.1:8087/update/SVersion.json',
 // AUTO_UPDATE_CHECK_STARTUP_DELAY: 5 * 1000 /* 5 seconds */,

  CRASH_REPORT_URL: 'https://webtorrent.io/desktop/crash-report',

  CONFIG_PATH: applicationConfigPath(APP_NAME),
  CONFIG_POSTER_PATH: path.join(applicationConfigPath(APP_NAME), 'Posters'),
  CONFIG_TORRENT_PATH: path.join(applicationConfigPath(APP_NAME), 'Torrents'),

  INC_URL: 'http://www.erayt.com',
  ISSUE_URL: 'http://www.erayt.com',

  IS_PRODUCTION: isProduction(),
  
  ROOT_PATH: __dirname,
  STATIC_PATH: path.join(__dirname, 'static'),

  PPAPI_PATH: path.join(process.cwd(), 'ppapi'),

  PDF_PDFURL:'file://' +path.join(__dirname , 'renderer','lib', 'pdfjs/web/viewer.html?file='),

  WINDOW_ABOUT: 'file://' + path.join(__dirname, 'renderer', 'about.html'),
  WINDOW_MAIN: 'file://' + path.join(__dirname, 'renderer', 'main.html'),

  WINDOW_OTHER: 'file://' + path.join(__dirname, 'renderer', 'other.html'),
  WINDOW_NOTI: 'file://' + path.join(__dirname, 'renderer', 'noti.html'),

  WINDOW_TEAROUT: 'file://' + path.join(__dirname, 'renderer', 'tearout.html'),
  TEAROUT_CSS:  path.join(__dirname, 'renderer', 'tearout.css'),

    WINDOW_SET: 'file://' + path.join(__dirname, 'renderer', 'settings.html'),

  CA_FILE_PATH: path.join(__dirname, 'common/keys/ca-cert.pem')
};

function isProduction () {
  if (!process.versions.electron) {
    return false
  }

  if (process.platform != 'win32') {
    return false;
  }
}

