
function toggle_css_by_id(styleId) {
	var style = document.getElementById(styleId);
	if (style) {
		style.disabled = !style.disabled
	} else {
		setTimeout(function () {
			toggle_style_by_id(styleId)
		}, 100)
	}
}
