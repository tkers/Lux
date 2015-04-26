function spinCode(elem, newCode) {

	var spinner = window.setInterval(function () {
		elem.innerHTML = Math.floor(Math.random() * 900000) + 100000;
	}, 25);
	
	window.setTimeout(function () {
		window.clearTimeout(spinner);
		elem.innerHTML = newCode;
	}, 400);
}

window.onload = function () {

    var serviceName = document.getElementById("servicename");
    var serviceCode = document.getElementById("servicecode");
    var serviceList = document.getElementById("servicelist");
    var serviceTimer = document.getElementById("servicetimer");

    var lastExpire = -1;

    var totp = new TOTP("twzunjmhli73wsv2");

    window.setInterval(function () {

        var expire = totp.getTTL();
        if (expire > lastExpire) {
            var token = totp.getToken();
            serviceName.innerHTML = "GitHub";
            spinCode(serviceCode, token);
        }
        lastExpire = expire;
        var timerWidth = 100 * expire / 30;
        serviceTimer.style.width = timerWidth + "%";
    }, 10);

};
