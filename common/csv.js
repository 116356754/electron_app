/**
 * Created by Administrator on 2016/4/29.
 */
module.exports = {
    exportcsv
};

var fs = require('fs');
var csv = require('fast-csv');
function exportcsv(jsonobj,filepath,cb)
{
    var csvStream = csv.createWriteStream({headers: true});

    var writableStream = fs.createWriteStream(filepath);
    writableStream.on("finish", function(){
        console.log("DONE!");
        cb(true);
    });

    writableStream.on('error',function(e){
        console.log(e);
        cb(false);
    });

    csv.write(jsonobj).pipe(writableStream);

    csvStream.end();
}




