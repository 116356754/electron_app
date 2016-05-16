/**
 * Created by Administrator on 2016/5/16.
 */

var electron = require('electron');
var remote = electron.remote;
var dialog = remote.dialog;

var fs = require('fs');

module.exports = {
    savePDFFileAs,
    saveCSVFileAs
};

function savePDFFileAs () {
    var opts = {
        title: 'Save pdf File',
        defaultPath: remote.app.getPath('downloads'),
        filters: [
            { name: 'pdf Files', extensions: ['pdf'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    };

    dialog.showSaveDialog(remote.getCurrentWindow(), opts, function (savePath) {
        remote.getCurrentWindow().webContents.printToPDF({
            printBackground:true,//打印css背景
            landscape :false//true是横向，false是纵向
        }, function (error, data) {
            if (error) throw error;
            fs.writeFile(savePath, data, function (error) {
                if(error)
                    alert('导出失败');
                else
                    alert('导出成功');
            })
        })
    })
}

var csv = require('../../common/csv.js');
function saveCSVFileAs(jsobj)
{
    var opts = {
        title: 'Save csv File',
        defaultPath: remote.app.getPath('downloads'),
        filters: [
            { name: 'csv Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    };

    dialog.showSaveDialog(remote.getCurrentWindow(), opts, function (savePath) {
        csv.exportcsv(jsobj,savePath,function(result){
            "use strict";
            if(result)
                alert('导出成功');
            else
                alert('导出失败');
        });
    })
}