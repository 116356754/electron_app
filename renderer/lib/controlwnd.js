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

    t.on('minimize', ()=>{ipcRenderer.send('min-window',remote.getCurrentWindow().id)});

    t.on('fullscreen',  ()=>{ipcRenderer.send('max-window',remote.getCurrentWindow().id)});

    t.on('close', ()=>{ipcRenderer.send('close-window',remote.getCurrentWindow().id)});
}