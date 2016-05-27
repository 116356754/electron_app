'use strict';
const app = require('electron').app;
const fs = require('fs');
const path = require('path');


function readConfigFile() {
    var con ={};
    var configFile = path.join(app.getPath('userData'), 'settings.json');
    try {
        con = JSON.parse(fs.readFileSync(configFile));
    } catch (err) {
        con = {'lang': 'en','style':'classic', "minimizeToTray": false, "closeToTray": false};//默认用户的配置
    }
    //console.log(JSON.stringify(con));
    return con;
}

function saveConfigFile(conf) {
    var configFile = path.join(app.getPath('userData'), 'settings.json');
    //console.log(JSON.stringify(conf));
    fs.writeFileSync(configFile, JSON.stringify(conf));
}

module.exports = {
    init: readConfigFile,
    save: saveConfigFile
};
