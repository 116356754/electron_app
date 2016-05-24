////http 
var request = require('request');
var qs = require('querystring');
var config = require('../config');

 function http_get(url_)
 {
	var data = {
        user: 'wangky',
        pass: '123'
    };
    var content = qs.stringify(data);

    request(
        {
            method: 'GET'
            , uri: url_+'?' + content
        }
        , function (error, response, body) {
            if(response.statusCode == 200)
                console.log('the decoded data is: ' + body);
            else {
                console.log('error: '+ response.statusCode)
                console.log(body)
            }
        });
 }

 
 function http_post(url_)
 {
	var formData = {
    	user: 'wangky',
    	email: 'wangky@erayt.com'
	};

	request.post({url: url_, formData: formData},
    	function (err, httpResponse, body) {
        	if (err) {
            	return console.error('upload failed:', err);
        	}
        console.log('Upload successful!  Server responded with:', body);
    });
}

 ////https 
 var fs = require('fs');
 function https_get(url_)
 {
	var data = {
    user: 'wangky',
    pass: '123'
	};//这是需要提交的数据
	
	var content = qs.stringify(data);
	
	var options = {
		url: url_+'?' + content,
		agentOptions: {
			ca: fs.readFileSync(config.CA_FILE_PATH),
			// Or use `pfx` property replacing `cert` and `key` when using private key, certificate and CA certs in PFX or PKCS12 format:
			// pfx: fs.readFileSync(pfxFilePath),
		}
	};
	
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);// Show the HTML for the Google homepage.
		}
	});
 }
 
 
var enc =require('../common/encrypt.js');
function http_ecas(host_,port_,action_,user_,pass_)
 {	
	var plaintext = '{"userId":"'+user_+'","passWord":"'+pass_+
	'","dynamicPass":"x",channelID:"C","safeValue":"2w3ee",custType:"1"}';
	console.log(plaintext);
	
	var content_='requestJson='+enc.encryptiontxt(plaintext);

	 request({
            method: 'GET', 
		  	uri: 'http://'+host_+':'+port_+'?' + '/'+action_+'?' + content_
        }, 
		function (error, response, body) {
            if(response.statusCode == 200)
                console.log('the decoded data is: ' + body);
            else {
                console.log('error: '+ response.statusCode)
                console.log(body)
            }
        });		
 }
 
 var iconv =require('iconv-lite');
 function http_proxy(proxy_url)
 {
	 var options = {
    	url: 'http://1212.ip138.com/ic.asp',
		// strictSSL : false,
		//rejectUnauthorized : false,
    	proxy:proxy_url,
    	timeout:5000
	};

	//代理地址：http://www.66ip.cn/index.html
	request(options, function (error, response, body) {
		console.log(error);
	}).pipe(iconv.decodeStream('gb2312')).collect(function (err, body) {
		console.log(body);
	});
 }
 
 function test1(host_,port_)
 {	
	var options = {
		hostname: host_,
		port: port_,
		path: '/' ,
		method: 'GET'
	};

	var req = http.request(options, function (res) {
		//console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
	});
	console.log('start http get a json');
	req.on('error', function (e) {
		console.log('problem with request: ' + e.message);
	});

	req.end();
 }
 
 function test2(host_,port_)
 {	
	var options = {
		hostname: host_,
		port: port_,
		path: '/read' ,
		method: 'GET'
	};

	var req = http.request(options, function (res) {
		//console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
	});
	console.log('start http get a json');
	req.on('error', function (e) {
		console.log('problem with request: ' + e.message);
	});

	req.end();
 }