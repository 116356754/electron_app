/**
 * Created by Administrator on 2016/5/4.
 */
var nodercedit = require('rcedit');

var options={
    'version-string':{
        CompanyName:'erayt Inc.',
        ProductName:'Titan',
        OriginalFilename:'Titan.exe',
        FileDescription:'HTML5 Titan For Windows',
        LegalCopyright:'Copyright © 2015-2016 Titan project'
    },
    'file-version':'1.5.0',
    'product-version':'1.5.0',
    'icon':'E:/enginer/resources/app/static/Titan.ico'
};
nodercedit("E:/enginer/Titan.exe", options, function(error)
{
    if(error)
        console.log(error);
});