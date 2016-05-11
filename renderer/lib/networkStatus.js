/**
 * Created by Administrator on 2016/4/26.
 */
"use strict";
///network status detect
const ipcRenderer = require('electron').ipcRenderer;
const nativeImage = require('electron').nativeImage;

// var config = require('../../config')
// var windows = require('../../main/windows');

module.exports = {
    init,
    isOnline
};

function init()
{
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline',  updateOnlineStatus);
    
    document.getElementById("netStatus").innerHTML = navigator.onLine ? 'online' : 'offline';
}

function isOnline()
{
    return navigator.onLine;
}

var updateOnlineStatus = function() {
    console.log( navigator.onLine ? 'online' : 'offline');
    document.getElementById("netStatus").innerHTML = navigator.onLine ? 'online' : 'offline';
    
    ipcRenderer.send('online-status-changed', navigator.onLine);
    
    // if(isOnline())
    // {
    //     windows.main.setOverlayIcon(nativeImage.createEmpty(),'online');
    // }
    // else{
    //     windows.main.setOverlayIcon(nativeImage.createEmpty(),'offline');
    // }
};

