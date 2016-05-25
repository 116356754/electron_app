/**
 * Created by Administrator on 2016/5/25.
 */
//判断当前线程是否是渲染进程,导出的是个变量
function isRenderer () {
    // node-integration is disabled
    if (!process) return true;

    // We're in node.js somehow
    if (!process.type) return false;

    return process.type === 'renderer'
}

module.exports = isRenderer();