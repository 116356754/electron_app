/**
 * Created by Administrator on 2016/5/19.
 */
var electron = require('electron');
var ipcRenderer = electron.ipcRenderer;
var remote = require('remote');

module.exports={
    init
};

function init() {

    document.querySelector('.min').addEventListener('click',  ()=>{ipcRenderer.send('min-window',remote.getCurrentWindow().id)});

    document.querySelector('.max').addEventListener('click',  ()=>{ipcRenderer.send('max-window',remote.getCurrentWindow().id)});

    document.querySelector('.close').addEventListener('click', ()=>{ipcRenderer.send('close-window',remote.getCurrentWindow().id)});
}