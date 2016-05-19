var electron = require('electron');
var EventEmitter = require('events');
var fs = require('fs');
var path = require('path');
var remote = require('remote');
console.log(process.cwd());

var config = require(path.join(process.cwd(), 'resources', 'app', 'config.js'));
var crashReporter = require(path.join(config.ROOT_PATH, 'crash-reporter.js'));
var {setDispatch} = require(path.join(config.RENDER_PATH, 'lib/dispatcher'));
setDispatch(dispatch);

var sound = require(path.join(config.RENDER_PATH, 'lib/sound'));

var windowState = {
    bounds: null, /* {x, y, width, height } */
    isFocused: true,
    isFullScreen: false
};
// This dependency is the slowest-loading, so we lazy load it
//var Cast = null

// Electron apps have two processes: a main process (node) runs first and starts
// a renderer process (essentially a Chrome window). We're in the renderer process,
// and this IPC channel receives from and sends messages to the main process
var ipcRenderer = electron.ipcRenderer;

var clipboard = electron.clipboard;
var dialog = remote.require('dialog');

//var vdomLoop

// Report crashes back to our server.
// Not global JS exceptions, not like Rollbar, handles segfaults/core dumps only
//crashReporter.init()

init();

/**
 * Called once when the application loads. (Not once per window.)
 * Connects to the torrent networks, sets up the UI and OS integrations like
 * the dock icon and drag+drop.
 */
function init() {
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
}

//预加载音频文件
function delayedInit() {
    sound.preload();
}

// Events from the UI never modify state directly. Instead they call dispatch()
function dispatch(action, ...args) {
    // Log dispatch calls, for debugging

    console.log('dispatch: %s %o', action, args);

    if (action === 'setDimensions') {
        setDimensions(args[0] /* dimensions */)
    }
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

// Set window dimensions to match video dimensions or fill the screen
function setDimensions(dimensions) {
    // Don't modify the window size if it's already maximized
    if (remote.getCurrentWindow().isMaximized()) {
        windowState.bounds = null;
        return
    }

    // Save the bounds of the window for later. See restoreBounds()
    windowState.bounds = {
        x: window.screenX,
        y: window.screenY,
        width: window.outerWidth,
        height: window.outerHeight
    };
    windowState.wasMaximized = remote.getCurrentWindow().isMaximized;

    // Limit window size to screen size
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    var aspectRatio = dimensions.width / dimensions.height;
    var scaleFactor = Math.min(
        Math.min(screenWidth / dimensions.width, 1),
        Math.min(screenHeight / dimensions.height, 1)
    );
    var width = Math.floor(dimensions.width * scaleFactor);
    var height = Math.floor(dimensions.height * scaleFactor);

    // Center window on screen
    var x = Math.floor((screenWidth - width) / 2);
    var y = Math.floor((screenHeight - height) / 2);

    ipcRenderer.send('setAspectRatio', aspectRatio);
    ipcRenderer.send('setBounds', {x, y, width, height})
}

function restoreBounds() {
    ipcRenderer.send('setAspectRatio', 0);
    if (windowState.bounds) {
        ipcRenderer.send('setBounds', windowState.bounds, false)
    }
}

// Write state.saved to the JSON state file
function saveState () {
    console.log('saving state');

    //处理一些关闭前需要保存的数据
    ipcRenderer.send('savedState');
}

function onError(err) {
    console.error(err.stack || err)
}

function onWarning(err) {
    console.log('warning: %s', err.message || err)
}