/**
 * Created by Administrator on 2016/5/19.
 */
module.exports = {
    init
};

function init(remoteFrameSign,remoteAppSign)
{
    if(!frameSign(remoteFrameSign)) return false;

    return appSign(remoteAppSign);

    //表示校验成功，可以启动
}
function frameSign (remoteFrameSign)
{
    var filepath = process.execPath;
    //59120c11e494586ef09277942066184c
    console.time('md5-file');
    console.log(filepath);
    var signature = encry.md5file(filepath);
    console.timeEnd('md5-file');

    if(remoteFrameSign == signature)
        return true;
    else
        return false;
}

function appSign(remoteAppSign)
{
    var filepath =path.join(process.cwd(),"resources",'app_bak.asar');
    //45b83d98593ba8425e59d125d45bb053
    console.time('md5-dir');
    console.log(filepath);
    var signature =  encry.md5dir(filepath);

    if(remoteAppSign == signature)
        return true;
    else
        return false;
}
