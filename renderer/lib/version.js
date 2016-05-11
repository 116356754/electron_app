/**
 * Created by Administrator on 2016/4/26.
 */
"use strict";

const ver=require('process');
const remote = require('electron').remote;
var os = require('os');

module.exports = {
    getProcessVersion,
    getElectronVersion,
    getAppVersion,
    isWin7plusOS,
    isWin8plusOS,
};

function getProcessVersion () {
    return ver.versions;
}

function getElectronVersion()
{
    return ver.versions.electron
}

function getAppVersion()
{
    return remote.app.getVersion();
}

function isWin7plusOS()
{
    var os_ver = os.release();
    //var os_ver = '6.2.7601';
    console.log('the release of the os is: ' + os_ver);
    var ver = parseFloat(os_ver);
    console.log(ver);
    
    if(ver>=6.1)
    {
      console.log('win 7');
      return true;
    }        
    else
    {
      console.log('win 7-');
      return false;
    }        
}

function isWin8plusOS()
{    
    var os_ver = os.release();
    //var os_ver = '6.2.7601';
    console.log('the release of the os is: ' + os_ver);
    var ver = parseFloat(os_ver);
    console.log(ver);
    
    if(ver>=6.2)
    {
      console.log('win 7+');
      return true;
    }        
    else
    {
      console.log('win 7');
      return false;
    }        
}
