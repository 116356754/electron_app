/**
 * Created by Administrator on 2016/5/25.
 */
//判断当前线程是否是渲染进程,导出的是个变量

'use strict'

;(function () {

    // Constructor
    function IsApi () {}

    // Checks if we are in renderer process
    IsApi.prototype.renderer = function () {
        if (!process) return true;

        // We're in node.js somehow
        if (!process.type) return false;

        return process.type === 'renderer';
    };

    // Checks if we are in main process
    IsApi.prototype.main = function () {
        return process.type === 'browser'
    };

    // Checks if we are under Mac OS
    IsApi.prototype.osx = function () {
        return process.platform === 'darwin'
    };

    // Checks if we are under Windows OS
    IsApi.prototype.windows = function () {
        return process.platform === 'win32'
    };

    // Checks if we are under Linux OS
    IsApi.prototype.linux = function () {
        return process.platform === 'linux'
    };

    // Checks if we are the processor's arch is x86
    IsApi.prototype.x86 = function () {
        return process.arch === 'ia32'
    };

    // Checks if we are the processor's arch is x64
    IsApi.prototype.x64 = function () {
        return process.arch === 'x64'
    };

    IsApi.prototype.isWin7plusOS =function()
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
    };

    // new instace
    const is = new IsApi();

    // exports
    module.exports = is
})();
