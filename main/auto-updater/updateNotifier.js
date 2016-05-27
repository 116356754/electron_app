/**
 * Created by Administrator on 2016/5/26.
 */
var windows = require('../windows');
const electron =require('electron');
const dialog = electron.dialog;

var path =require('path');
module.exports = {
    updateConfirm,
    updateNofierResult,
    createUpdateNotifier,
    updateError,
    closeUpdateNotifier
};

function updateConfirm(cb)
{
    return dialog.showMessageBox(windows.main,{
        type: "question",
        icon: __dirname+'/Assets/logo.ico',
        title: 'update available',
        message: 'Do you want to update application?',
        buttons: ['Yes Now','Next Time']
    });
}

function updateNofierResult(result)
{
    if(windows.updateNotifier)
    {
        var code ="var resultElement = document.getElementById('update-result');resultElement.innerHTML='"+result+"'";
        windows.updateNotifier.webContents.executeJavaScript(code);
    }
}
function createUpdateNotifier(info)
{
    windows.createUpdateNotifier('Update available : '+info);
}

function updateError(err)
{
    if(!windows.updateNotifier)
        windows.createUpdateNotifier('Update fail');

    windows.updateNotifier.webContents.loadURL(path.join(__dirname,'Assets','error.html'));
    var code ="var resultElement = document.getElementById('error-info');resultElement.innerHTML='"+err+"'";
    windows.updateNotifier.webContents.executeJavaScript(code);
}

function closeUpdateNotifier()
{
    if(windows.updateNotifier)
        windows.updateNotifier.close();
}
