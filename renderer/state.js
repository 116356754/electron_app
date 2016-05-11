var os = require('os');
var path = require('path');

var config = require('../config');
//var LocationHistory = require('./lib/location-history')

module.exports = {
  getInitialState
};

function getInitialState () {
  return {
    /*
     * Temporary state disappears once the program exits.
     * It can contain complex objects like open connections, etc.
     */
    //location: new LocationHistory(),
    window: {
      bounds: null, /* {x, y, width, height } */
      isFocused: true,
      isFullScreen: false,
      title: config.APP_WINDOW_TITLE
    },
    //downloadPath: path.join(os.homedir(), 'Downloads'),
    modal: null, /* modal popover */
    errors: [], /* user-facing errors */

    /*
     * Saved state is read from and written to a file every time the app runs.
     * It should be simple and minimal and must be JSON.
     *
     * Config path:
     *
     * OS X                 ~/Library/Application Support/WebTorrent/config.json
     * Linux (XDG)          $XDG_CONFIG_HOME/WebTorrent/config.json
     * Linux (Legacy)       ~/.config/WebTorrent/config.json
     * Windows (> Vista)    %LOCALAPPDATA%/WebTorrent/config.json
     * Windows (XP, 2000)   %USERPROFILE%/Local Settings/Application Data/WebTorrent/config.json
     *
     * Also accessible via `require('application-config')('WebTorrent').filePath`
     */
    saved: {}
  }
}