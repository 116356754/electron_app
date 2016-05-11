var electron = require('electron');
var EventEmitter = require('events');
var fs = require('fs');
var path = require('path');
var remote = require('remote');

var config = require('../config');
var crashReporter = require('../crash-reporter');
var {setDispatch} = require('./lib/dispatcher');
setDispatch(dispatch);
var State = require('./state');
var sound = require('./lib/sound');

// This dependency is the slowest-loading, so we lazy load it
//var Cast = null

// Electron apps have two processes: a main process (node) runs first and starts
// a renderer process (essentially a Chrome window). We're in the renderer process,
// and this IPC channel receives from and sends messages to the main process
var ipcRenderer = electron.ipcRenderer;

var clipboard = electron.clipboard;
var dialog = remote.require('dialog');

// For easy debugging in Developer Tools
var state = global.state = State.getInitialState();

//var vdomLoop

// Report crashes back to our server.
// Not global JS exceptions, not like Rollbar, handles segfaults/core dumps only
//crashReporter.init()

// All state lives in state.js. `state.saved` is read from and written to a file.
// All other state is ephemeral. First we load state.saved then initialize the app.
init();

/**
 * Called once when the application loads. (Not once per window.)
 * Connects to the torrent networks, sets up the UI and OS integrations like
 * the dock icon and drag+drop.
 */
function init () {
  // ...keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    if (e.which === 27) { /* ESC means either exit fullscreen or go back */
      if (state.window.isFullScreen) {
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

function delayedInit () {
  sound.preload();
}


// Events from the UI never modify state directly. Instead they call dispatch()
function dispatch (action, ...args) {
  // Log dispatch calls, for debugging

  console.log('dispatch: %s %o', action, args);

  if (action === 'setDimensions') {
    setDimensions(args[0] /* dimensions */)
  }
  if (action === 'toggleFullScreen') {
    ipcRenderer.send('toggleFullScreen', args[0] /* optional bool */)
  }
}

function setupIpc () {
  ipcRenderer.send('ipcReady');

  ipcRenderer.on('log', (e, ...args) => console.log(...args));
  ipcRenderer.on('error', (e, ...args) => console.error(...args));

  ipcRenderer.on('dispatch', (e, ...args) => dispatch(...args));

  ipcRenderer.on('fullscreenChanged', function (e, isFullScreen) {
    state.window.isFullScreen = isFullScreen;
  })
}

// Set window dimensions to match video dimensions or fill the screen
function setDimensions (dimensions) {
  // Don't modify the window size if it's already maximized
  if (remote.getCurrentWindow().isMaximized()) {
    state.window.bounds = null;
    return
  }

  // Save the bounds of the window for later. See restoreBounds()
  state.window.bounds = {
    x: window.screenX,
    y: window.screenY,
    width: window.outerWidth,
    height: window.outerHeight
  };
  state.window.wasMaximized = remote.getCurrentWindow().isMaximized;

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

function restoreBounds () {
  ipcRenderer.send('setAspectRatio', 0);
  if (state.window.bounds) {
    ipcRenderer.send('setBounds', state.window.bounds, false)
  }
}

function onError (err) {
  console.error(err.stack || err)
}

function onWarning (err) {
  console.log('warning: %s', err.message || err)
}