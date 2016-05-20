/**
 * Created by Administrator on 2016/5/20.
 */
var auto = require('./autoupdater');

auto.setFeedURL({updateURL:'http://localhost:8087/update/SVersion.json',frameVer:'0.36.3',appVer:'1.5.0',downloadPath:"E:"});
auto.on('error',(err)=>console.log(err));
auto.on('checking-for-update',()=>console.log('checking-for-update'));
auto.on('update-available',(version,downloadurl)=>console.log('update-available'+version,downloadurl));
auto.on('update-not-available',(frameMD5,appMD5)=>console.log('update-not-available '+frameMD5+appMD5));
auto.on('update-downloaded',(localpath)=>{
    console.log('update-downloaded'+localpath);
    setTimeout(()=> {
        auto.quitAndInstall(localpath);
        //process.exit(0);
    },300);
});

auto.checkForUpdates();

setInterval(()=>{
    console.log('alive');
}, 3000);
