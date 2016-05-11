/**
 * Created by Administrator on 2016/4/26.
 */
module.exports = wssclient;
var WebSocket = require('ws');
var fs = require('fs');

//只在被实例化后的实例中可调用
function wssclient(host, port) {
    var host_;
    var port_;
    var ws_=null;
    this.host_ = host;
    this.port_ =port;
}

wssclient.prototype.wss_connect = function(){
    console.log(this.host_+this.port_);
    var clientOptions = {
        ca: [fs.readFileSync(__dirname + '/keys/ca-cert.pem')]
    };

    this.ws_ = new WebSocket('wss://' + this.host_ + ":" + this.port_,clientOptions);

    this.ws_.on('open', function () {
        console.log('open websocket + SSL success!');
    });

    this.ws_.on('message', function (data) {
        console.log(data.toString());
    });

    this.ws_.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
};

wssclient.prototype.wss_stop = function(){
    this.ws_.terminate();
    console.log("ws client stop");
};

wssclient.prototype.wss_sendmsg = function(content){
    try {
        this.ws_.send(content);
    }
    catch (e) { /* handle error */
    }
    console.log("ws client send:"+content);
};