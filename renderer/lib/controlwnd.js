/**
 * Created by Administrator on 2016/5/19.
 */
var electron = require('electron');
var ipcRenderer = electron.ipcRenderer;
var remote = require('remote');
var titlebar = require('titlebar');

module.exports={
    init
};

function init() {

    var t = titlebar();
    t.appendTo(document.body);

    t.on('close', function () {
        remote.getCurrentWindow().close();
    });

    t.on('minimize', function () {
        remote.getCurrentWindow().minimize();
    });

    t.on('fullscreen', function () {
        var win = remote.getCurrentWindow();
        if (win.isMaximized())
            win.unmaximize();
        else
            win.maximize();
    });
}