/**
 * Created by Administrator on 2016/6/1.
 */

document.onreadystatechange =function(){
    var div = document.createElement('div');
    div.className  ='title';
    div.style = "display:inline-block; vertical-align:middle;";

    var img =document.createElement('img');
    img.src="../static/logo.ico";
    img.width="18" ;
    img.height="18";
    div.appendChild(img);

    var span =document.createElement('span');
    span.id= "win-title";
    span.innerText ='TiTan';
    div.appendChild(span);

    var body   = document.body || document.getElementsByTagName('body')[0];

    body.insertBefore(div,body.childNodes[0]);

    var titlebar = require('eltitlebar');
    var t = titlebar();
    t.appendTo(body);
};