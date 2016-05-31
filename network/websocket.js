module.exports =wsclient;

var WebSocket = require('ws');
var fs = require('fs');

//只在被实例化后的实例中可调用
function wsclient(host, port) {
    var host_;
    var port_;
    var ws_=null;
    this.host_ = host; 
    this.port_ =port;
}

wsclient.prototype.ws_connect = function(){
    console.log(this.host_+this.port_);

    this.ws_ = new WebSocket('ws://' + this.host_ + ":" + this.port_);
 
    this.ws_.on('open', function () {
        console.log('open websocket success!');
    });

    this.ws_.on('message', function (data) {
        console.log(data.toString());
    });

    this.ws_.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
};

wsclient.prototype.ws_stop = function(){
    this.ws_.terminate();
    console.log("ws client stop");
};

wsclient.prototype.ws_sendmsg = function(content){
     try {
            this.ws_.send(content);
        }
        catch (e) { /* handle error */
     }
    console.log("ws client send:"+content);
};
