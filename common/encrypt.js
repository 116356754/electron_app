module.exports={
    encryptiontxt,
    decryptiontxt
};

var nodeCrypto  = require('crypto');
var ENCRYPT_MODE ='aes-128-ecb';
var ENCRYPT_KEY = '12345678901erayt';

//data 是准备加密的字符串
function encryptiontxt(data) {
	//console.log(nodeCrypto);
    var iv = "";
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    var cipher = nodeCrypto.createCipheriv(ENCRYPT_MODE, ENCRYPT_KEY, iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
	var encry = cipherChunks.join('');
	console.log(encry);
    return encry;
}

//data 是你的准备解密的字符串
function decryptiontxt(data) {
    var iv = "";
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    var decipher = nodeCrypto.createDecipheriv(ENCRYPT_MODE, ENCRYPT_KEY, iv);
    decipher.setAutoPadding(true);

    cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));
	
	var decry = cipherChunks.join('');
	console.log(decry);
    return decry;
}