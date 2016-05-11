/**
 * Created by Administrator on 2016/5/4.
 */
var nodercedit = require('rcedit');

var options={
    'version-string':{
        CompanyName:'erayt Inc.',
        ProductName:'Taitan',
        OriginalFilename:'Taitan.exe',
        FileDescription:'HTML5 Taitan For Windows',
        LegalCopyright:'Copyright © 2015-2016 Taitan project'
    },
    'file-version':'1.5.0',
    'product-version':'1.5.0',
    'icon':'E:/enginer/resources/app/static/TaiTan.ico'
};
nodercedit("E:/enginer/Taitan.exe", options, function(error)
{
    if(error)
        console.log(error);
});