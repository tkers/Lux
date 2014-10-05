function getExpiry() {

	var timeStep = 30;

	var time = new Date().getTime() / 1000;	
	var timeLeft = time % timeStep;
	
	// return seconds left in current timestep
	return timeStep - timeLeft;
}

function generateTOTP(key) {

	var tokenLength = 6;
	var timeStep = 30;
	
	// get the current timestep
	var time = new Date().getTime() / 1000;	
	var timeCounter = Math.floor(time / timeStep);
	
	// calculate token value
	var value = generateHOTP(key, timeCounter);
	
	// only use 6 last digits
	var token = value % (Math.pow(10, tokenLength));
	
	// pad with zeroes
	token = zeropad(token, 6);
	
	// all done!
	return token;
}

function generateHOTP(key, counter) {

	// convert key and counter to bytes
	counter = decToBytes(counter, 8);
	key = b32ToBytes(key.toUpperCase());

	// calculate HMAC value
	var hmac = Crypto.HMAC(Crypto.SHA1, counter, key);
	var bytes = hexToBytes(hmac);
	
	// truncate hash
	var off = bytes[19] & 0xf;
	var truncate = (bytes[off] & 0x7f) << 24 |
				   (bytes[off + 1] & 0xff) << 16 |
		  		   (bytes[off + 2] & 0xff) << 8  |
				   (bytes[off + 3] & 0xff);
				   				   
	return truncate;
}

function decToBytes(x, len) {
	var bytes = new Array();
	while (x > 0) {
		bytes.unshift(x & 255);
		x >>= 8;
	}
	while (bytes.length < len) {
		bytes.unshift(0);
	}
	return bytes;
}

function b32ToBytes(b32) {
	var hex = b32ToHex(b32);
	var bytes = hexToBytes(hex);
	return bytes;
}

function hexToBytes(x) {
	var bytes = new Array();
	for(var c = 0; c < x.length; c += 2) {
		bytes.push(parseInt(x.substr(c, 2), 16));
	}
	return bytes;
}	

function b32ToHex(x) {

	var dict = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
	
	var bits = "";
	for(var i = 0; i < x.length; i++){
		var value = dict.indexOf(x.charAt(i).toUpperCase());
		bits += zeropad(value.toString(2), 5);
	}
	
	var hex = "";
	for(i = 0; i + 4 <= bits.length; i += 4){
		var chunk = bits.substr(i, 4);
		hex += parseInt(chunk, 2).toString(16);
	}
	
	return hex;
}

function zeropad(value, len) {
	value = value.toString();
	while (value.length < len) {
		value = "0" + value;
	}
	return value;
}