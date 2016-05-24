var appcheck = require('./checksum');

var  validatecount =0;
appcheck.on('check-validate', ()=>{
    console.log('check app or frame is validate!');
    validatecount++;
    if(validatecount==2)
        process.send({ result: true });
});

appcheck.on('check-not-validate', ()=> {
    console.log('not validate!');
    process.send({ result: false });
});

//接收到的文件路径
process.on('message', function(m) {
    appcheck.start(m.frameSum,m.appSum);//检查程序是否有效的md5值
    console.log(m);
    appcheck.frameSign(m.exepath);
    appcheck.appSign(m.dirpath);
});