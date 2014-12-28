function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	return (false);
}

document.addEventListener("DOMContentLoaded", function (event) {
	var style = document.getElementById('dark_css');
	style.disabled = getQueryVariable('theme') == 'light';
});

function themeButton() {
	if (getQueryVariable('theme') == 'light') {
		document.location = '?theme=dark'
	} else {
		document.location = '?theme=light'
	}
}

function themeLink(element) {
	var current = getQueryVariable('theme');
	if (element.href.indexOf('?theme=') > -1 || element.href.indexOf('&theme=') > -1) {
	} else {
		element.href += "?theme=" + (current ? current : 'dark');
	}
}
