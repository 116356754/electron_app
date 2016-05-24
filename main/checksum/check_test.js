
var cp = require('child_process');

var child = cp.fork(__dirname+'/forkChild.js');
var preFrameSum = '9afb0857744d8b208040736ec6aff677';
var preAppSum = '440ff903194a47e1831bf42cec3ca790';

//收到哈希的结果
child.on('message', function(m) {
    console.log('hash result is :'+m.result);
    child.kill('SIGTERM');
});

//发送文件路径
child.send({frameSum:preFrameSum,appSum:preAppSum,
    exepath:process.execPath,
    dirpath:'E:/electron_app/resources/app'
});

setInterval(()=>console.log('alive'),1000);
