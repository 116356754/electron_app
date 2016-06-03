var path = require('path');
var qs = require("querystring");

var APP_NAME = 'Titan';
var APP_TEAM = 'The HTML5 Project';
var APP_VERSION = require('./package.json').version;
module.exports = {
    HAVE_FRAME:false,//所有的窗体是否含有frame

    APP_COPYRIGHT: 'Copyright © 2015-2016 ' + APP_TEAM,
    APP_FILE_ICON: path.join(__dirname, 'static', 'TitanFile'),
    APP_ICON: path.join(__dirname, 'static', 'logo'),

    APP_NAME: APP_NAME,
    APP_TEAM: APP_TEAM,
    APP_VERSION: APP_VERSION,
    APP_WINDOW_TITLE: APP_NAME,

    AUTO_UPDATE_URL: 'http://127.0.0.1:8088/update/SVersion.json',
    AUTO_UPDATE_CHECK_STARTUP_DELAY: 50 * 1000 /* 5 seconds */,

    CRASH_REPORT_URL: 'https://www.erayt.com/desktop/crash-report',

    INC_URL: 'http://www.erayt.com',
    ISSUE_URL: 'https://github.com/116356754/electron_app/issues',

    IS_PRODUCTION: isProduction(),

    ROOT_PATH: __dirname,
    MAIN_PATH:path.join(__dirname, 'main'),
    STATIC_PATH: path.join(__dirname, 'static'),
    RENDER_PATH:path.join(__dirname, 'renderer'),
    COMM_PATH:path.join(__dirname, 'common'),
    PPAPI_PATH: path.join(process.cwd(), 'ppapi'),

    WINDOW_ABOUT: 'file://' + path.join(__dirname, 'renderer', 'about.html'),
    WINDOW_MAIN: 'file://' + path.join(__dirname, 'renderer', 'main.html'),
    //WINDOW_MAIN: 'file://' + path.join(__dirname, 'renderer', 'titan-elec','views/index/index.html'),
    //WINDOW_MAIN: 'http://localhost:8080',
    //WINDOW_ABOUT: 'http://www.codeproject.com/Lounge.aspx',

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
