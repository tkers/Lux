function spinCode(elem, newCode) {

	var spinner = window.setInterval(function () {
		var token = Math.floor(Math.random() * 900000) + 100000;
		elem.innerHTML = token.toString().split("").map(function (n) { return "<span class='digit'>"+n+"</span>"; }).join("");
	}, 25);
	
	window.setTimeout(function () {
		window.clearTimeout(spinner);
		elem.innerHTML = newCode.toString().split("").map(function (n) { return "<span class='digit'>"+n+"</span>"; }).join("");
	}, 400);
}

window.onload = function () {

    var serviceName = document.getElementById("servicename");
    var serviceCode = document.getElementById("servicecode");
    var serviceList = document.getElementById("servicelist");
    //var serviceTimer = document.getElementById("servicetimer");

    var totp = new TOTP("twzunjmhli73wsv2");
    serviceName.innerHTML = "GitHub";

    var loop = function () {

        var expire = totp.getTTL();
        if (expire > lastExpire) {
            var token = totp.getToken();
            spinCode(serviceCode, token);
        }
        lastExpire = expire;
        //var timerWidth = 100 * expire / 30;
        //serviceTimer.style.width = timerWidth + "%";

        window.requestAnimationFrame(loop);
    };

    var lastExpire = -1;
    loop();
};
