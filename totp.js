var TOTP = (function () {

    function TOTP(key, options) {

        if (!key) throw new Error("No key provided");
        if (!options) options = {};

        this._key = key;
        this._size = options.size || 6;
        this._interval = options.interval || 30;
    }

    TOTP.prototype.getToken = function (date) {

        // defaults to getting current token
        if (!date) date = new Date();

        // get the current timestep
        var time = date.getTime() / 1000;
        var timeStep = Math.floor(time / this._interval);

        // calculate token value
        var value = generateHOTP(this._key, timeStep);

        // only use 6 last digits
        var token = value % (Math.pow(10, this._size));

        // pad with zeroes
        token = zeroPad(token, this._size);

        // all done!
        return token;
    };

    TOTP.prototype.getTTL = function () {

        var now = new Date().getTime() / 1000;
        var age = now % this._interval;

        // return seconds left
        return this._interval - age;
    };

    function generateHOTP(key, counter) {

    	// convert key and counter to bytes
    	counter = decToBytes(counter, 8);
    	key = b32ToBytes(key);

    	// calculate HMAC value
    	var hash = Crypto.HMAC(Crypto.SHA1, counter, key);
    	var bytes = hexToBytes(hash);

    	// truncate hash
    	var off = bytes[19] & 0xf;
    	return (bytes[off]     & 0x7f) << 24 |
               (bytes[off + 1] & 0xff) << 16 |
               (bytes[off + 2] & 0xff) << 8  |
               (bytes[off + 3] & 0xff);
    }

    function decToBytes(x, n) {

    	var bytes = [];
    	while (x > 0) {
    		bytes.unshift(x & 255);
    		x >>= 8;
    	}

    	zeroPadArray(bytes, n);

    	return bytes;
    }

    function b32ToBytes(x) {

        var bits = b32ToBits(x);
        return bitsToBytes(bits);
    }

    function hexToBytes(x) {

    	var bytes = [];
    	for(var i = 0; i < x.length; i += 2) {
            var byte = parseInt(x.substr(i, 2), 16);
    		bytes.push(byte);
    	}

    	return bytes;
    }

    function b32ToBits(x) {

        var dict = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        var bits = "";
        for (var i = 0; i < x.length; i++) {
            var value = dict.indexOf(x.charAt(i).toUpperCase());
            bits += zeroPad(value.toString(2), 5);
        }

        return bits;
    }

    function bitsToBytes(x) {

        var bytes = [];
        for(var i = 0; i < x.length; i += 8) {
            var byte = parseInt(x.substr(i, 8), 2);
            bytes.push(byte);
        }

        return bytes;
    }

    function zeroPad(x, n) {

    	x = x.toString();
    	while (x.length < n) {
    		x = "0" + x;
    	}

    	return x;
    }

    function zeroPadArray(a, n) {

        while (a.length < n) {
            a.unshift(0);
        }
    }

    return TOTP;
})();