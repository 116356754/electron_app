/**
 * Created by Administrator on 2016/5/4.
 */
var nodercedit = require('rcedit');
var path = require('path');

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
    'icon':path.join(__dirname,'..','static/logo.ico')
};
console.log(__dirname);
nodercedit(path.join(__dirname,'..','..','..','Titan.exe'), options, function(error)
{
    if(error)
        console.log(error);
});