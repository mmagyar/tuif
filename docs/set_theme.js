/* jshint browser:true*/
document.addEventListener("DOMContentLoaded", function (event) {
	setThemeToCookie();
});

function setThemeToCookie() {
	var style = document.getElementById('dark_css');
	style.disabled = getCookie('theme') == 'light';
}
function themeButton() {
	var theme = getCookie('theme');
	removeCookie('theme'); //to ensure that there are no local duplicates
	if (theme == 'light') {
		setCookie("theme", "dark");
	} else {
		setCookie("theme", "light");
	}
	setThemeToCookie();
}

function getCookie(sKey) {
	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"),
			"$1")) || null;
}
function setCookie(sKey, sValue) {
	document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + "; expires=Fri, 31 Dec 9999 23:59:59 GMT" + "; path=/";
}
function removeCookie(sKey, sPath, sDomain) {
	if (!(new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie)) {
		return false;
	}
	document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
	return true;
}
