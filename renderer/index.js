var electron = require('electron');
var ipcRenderer = electron.ipcRenderer;
var remote = electron.remote;

var EventEmitter = require('events');
var fs = require('fs');
var path = require('path');

var config = require(path.join(__dirname, '..', 'config.js'));
var {setDispatch} = require(path.join(config.RENDER_PATH, 'lib/dispatcher'));
setDispatch(dispatch);

var sound = require(path.join(config.RENDER_PATH, 'lib/sound'));

var windowState = {
    bounds: null, /* {x, y, width, height } */
    isFocused: true,
    isFullScreen: false,
    isMaximized:false,
    isMinimized:false
};

// Report crashes back to our server.
// Not global JS exceptions, not like Rollbar, handles segfaults/core dumps only
//var crashReporter = require(path.join(config.ROOT_PATH, 'crash-reporter.js'));
//crashReporter.init()

(function init() {
    // ...keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.which === 27) { /* ESC means either exit fullscreen or go back */
            if (windowState.isFullScreen) {
                dispatch('toggleFullScreen')
            }
        }
    });

    // Listen for messages from the main process
    setupIpc();

    // Done! Ideally we want to get here <100ms after the user clicks the app
    sound.play('STARTUP');

    window.setTimeout(delayedInit, 5000);

    console.timeEnd('init');
})();

//预加载音频文件
function delayedInit() {
    sound.preload();
}

// Events from the UI never modify state directly. Instead they call dispatch()
function dispatch(action, ...args) {
    // Log dispatch calls, for debugging

    console.log('dispatch: %s %o', action, args);
    if (action === 'toggleFullScreen') {
        ipcRenderer.send('toggleFullScreen', args[0] /* optional bool */)
    }
    if (action === 'saveState') {
        saveState()
    }
}

function langChanged(newlang) {
    console.log('current language is ' + newlang);
}

function styleChanged(newstyle) {
    console.log('current style is ' + newstyle);
}

// Electron apps have two processes: a main process (node) runs first and starts
// a renderer process (essentially a Chrome window). We're in the renderer process,
// and this IPC channel receives from and sends messages to the main process
function setupIpc() {
    ipcRenderer.send('ipcReady');

    ipcRenderer.on('log', (e, ...args) => console.log(...args));
    ipcRenderer.on('error', (e, ...args) => console.error(...args));

    ipcRenderer.on('dispatch', (e, ...args) => dispatch(...args));

    //对于语言和风格样式变化时的通知消息
    ipcRenderer.on('changeLanguage', (e, ...args) => langChanged(...args));
    ipcRenderer.on('changeStyle', (e, ...args) => styleChanged(...args));

    ipcRenderer.on('fullscreenChanged', function (e, isFullScreen) {
        windowState.isFullScreen = isFullScreen;
    })
}

// save some thing before quite
function saveState () {
    console.log('saving state');
    //处理一些关闭前需要保存的数据
    ipcRenderer.send('savedState');
}