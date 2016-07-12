/**
 * Created by Administrator on 2016/7/12.
 */
module.exports = {
    init
};

var wswrap = require('wsobserver');
var config = require('../config');
//websocket client agent in main process

function init() {
    global.sharedObj.wsObserver =wswrap.observer;
    var ws = new wswrap.wsclient(config.WEBSOCKET_URL);
    ws.ws_connect();
}