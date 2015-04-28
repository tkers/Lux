var TOTP = (function () {

    /**
     * Creates a new TOTP object used for generating and verifying tokens
     *
     * @param {string}       key                Base32 encoded key
     * @param {number=}      options.size       Number of digits in generated token (default: 6)
     * @param {number=}      options.interval   Number of seconds that a token is valid (default: 30)
     * @param {window=}      options.window     Window in which a token is concidered valid (default: 1)
     *                                          (<interval> seconds older or newer than current token is still valid)
     * @constructor
     */
    function TOTP(key, options) {

        if (!key) throw new Error("No key provided");
        if (!options) options = {};

        this._key = key;
        this._size = options.size || 6;
        this._interval = options.interval || 30;
        this._window = options.window || 1;
    }

    /**
     * Calculate the currently valid token
     *
     * @param {Date=}       date        Optional date/time for which to calculate token (default: current date)
     *
     * @returns {string}                The token
     */
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

    /**
     * Returns the seconds left until the current token should be renewed.
     * Note that depending on the defined <window>, the token will still validate after this time period.
     *
     * @returns {number}         Number of seconds that the token is still valid
     */
    TOTP.prototype.getTTL = function () {

        var now = new Date().getTime() / 1000;
        var age = now % this._interval;

        // return seconds left
        return this._interval - age;
    };

    /**
     * Verifies a given token
     * Tokens that are <window> timesteps older/newer than the current token (+/- 30 seconds with default values)
     * are also considered valid to allow for delays and inaccuracies in the clients clock.
     *
     * @param {string}      token       The token to verify
     *
     * @returns {boolean}               Whether the token is valid
     */
    TOTP.prototype.verify = function (token) {

        var now = new Date().getTime();
        for (var i = -this._window; i <= this._window; i++) {

            // get time offset in seconds
            var offset = i * this._interval * 1000;

            // calculate valid token for timeframe
            var valid = this.getToken(new Date(now + offset));

            // return true if the given token is valid
            if (valid === token) return true;
        }

        // no valid token matched
        return false;
    };

    /**
     * Generate a HOTP token
     *
     * @param {string}      key         Base32 encoded key to use
     * @param {number}      counter     Value of the counter
     *
     * @returns {number}                The HOTP token
     * @private
     */
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

    /**
     * Converts decimal number to byte array
     *
     * @param {number}      x       The number to convert
     * @param {number}      n       Minimum length of the array (will be zero padded)
     *
     * @returns {Array}             The byte array
     * @private
     */
    function decToBytes(x, n) {

    	var bytes = [];
    	while (x > 0) {
    		bytes.unshift(x & 255);
    		x >>= 8;
    	}

    	zeroPadArray(bytes, n);

    	return bytes;
    }

    /**
     * Converts a base32 encoded string to byte array
     *
     * @param {string}      x       The base32 encoded string to convert
     *
     * @returns {Array}             The byte array
     * @private
     */
    function b32ToBytes(x) {

        var bits = b32ToBits(x);
        return bitsToBytes(bits);
    }

    /**
     * Converts a HEX value to byte array
     *
     * @param {string}      x       The HEX value
     *
     * @returns {Array}             The byte array
     * @private
     */
    function hexToBytes(x) {

    	var bytes = [];
    	for(var i = 0; i < x.length; i += 2) {
            var byte = parseInt(x.substr(i, 2), 16);
    		bytes.push(byte);
    	}

    	return bytes;
    }

    /**
     * Converts a base32 encoded string to bits
     *
     * @param {string}      x       The base32 encoded string to convert
     *
     * @returns {string}            The bits
     * @private
     */
    function b32ToBits(x) {

        var dict = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        var bits = "";
        for (var i = 0; i < x.length; i++) {
            var value = dict.indexOf(x.charAt(i).toUpperCase());
            bits += zeroPad(value.toString(2), 5);
        }

        return bits;
    }

    /**
     * Converts bits to bytes
     *
     * @param {string}      x       The bits to convert
     *
     * @returns {Array}             The byte array
     * @private
     */
    function bitsToBytes(x) {

        var bytes = [];
        for(var i = 0; i < x.length; i += 8) {
            var byte = parseInt(x.substr(i, 8), 2);
            bytes.push(byte);
        }

        return bytes;
    }

    /**
     * Zero pads a number
     *
     * @param {number|string}       x       The number to zero pad
     * @param {number}              n       Desired length after zero padding
     *
     * @returns {String}                    The zero padded number
     * @private
     */
    function zeroPad(x, n) {

    	x = x.toString();
    	while (x.length < n) {
    		x = "0" + x;
    	}

    	return x;
    }

    /**
     * Zero pads an array
     *
     * @param {Array}       a       The array to zero pad
     * @param {number}      n       Desired length of array after zero padding
     *
     * @private
     */
    function zeroPadArray(a, n) {

        while (a.length < n) {
            a.unshift(0);
        }
    }

    return TOTP;
})();