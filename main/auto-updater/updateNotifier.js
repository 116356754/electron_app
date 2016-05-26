/**
 * Created by Administrator on 2016/5/26.
 */
var windows = require('../windows');
module.exports = {
    updateNofierResult,
    createUpdateNotifier,
    closeUpdateNotifier
};

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

function closeUpdateNotifier()
{
    if(windows.updateNotifier)
        windows.updateNotifier.close();
}
