var path = require('path');
var qs = require("querystring");

var APP_NAME = 'Taitan';
var APP_TEAM = 'The HTML5 Project';
var APP_VERSION = require('./package.json').version;
module.exports = {
    APP_COPYRIGHT: 'Copyright © 2015-2016 ' + APP_TEAM,
    APP_FILE_ICON: path.join(__dirname, 'static', 'TaiTanFile'),
    APP_ICON: path.join(__dirname, 'static', 'TaiTan'),

    APP_NAME: APP_NAME,
    APP_TEAM: APP_TEAM,
    APP_VERSION: APP_VERSION,
    APP_WINDOW_TITLE: APP_NAME,

    AUTO_UPDATE_URL: 'http://127.0.0.1:8087/update/SVersion.json',
    // AUTO_UPDATE_CHECK_STARTUP_DELAY: 5 * 1000 /* 5 seconds */,

    CRASH_REPORT_URL: 'https://www.erayt.com/desktop/crash-report',

    INC_URL: 'http://www.erayt.com',
    ISSUE_URL: 'https://github.com/116356754/electron_app/issues',

    IS_PRODUCTION: isProduction(),

    ROOT_PATH: __dirname,
    STATIC_PATH: path.join(__dirname, 'static'),
    RENDER_PATH:path.join(__dirname, 'renderer'),
    PPAPI_PATH: path.join(process.cwd(), 'ppapi'),

    PDF_URL: 'file://' + path.join(__dirname, 'renderer', 'lib', 'pdfjs/web/viewer.html?file='),

    WINDOW_ABOUT: 'file://' + path.join(__dirname, 'renderer', 'about.html'),
    WINDOW_MAIN: 'file://' + path.join(__dirname, 'renderer', 'main.html'),
    //WINDOW_MAIN: 'file://' + path.join(__dirname, 'renderer', 'views/login/html/login.html'),
    //WINDOW_MAIN: 'http://www.codeproject.com',
    //WINDOW_ABOUT: 'http://www.codeproject.com/Lounge.aspx',

    WINDOW_OTHER: 'file://' + path.join(__dirname, 'renderer', 'other.html'),
    WINDOW_NOTI: 'file://' + path.join(__dirname, 'renderer', 'noti.html'),

    WINDOW_TEAROUT: 'file://' + path.join(__dirname, 'renderer','tearout', 'tearout.html'),

    TEAROUT_JS: path.join(__dirname, 'renderer','tearout' ,'tearout.js'),
    TEAROUT_CSS: path.join(__dirname, 'renderer','tearout', 'tearout.css'),

    WINDOW_SET: 'file://' + path.join(__dirname, 'renderer', 'settings.html'),

    CA_FILE_PATH: path.join(__dirname, 'common/keys/ca-cert.pem')
};

function isProduction() {
    if (!process.versions.electron) {
        return false
    }

    if (process.platform != 'win32') {
        return false;
    }
}
