var events = require('events');
var interface = require('./interface.js');
var term = require('./ansi_terminal.js');
var common = require('./common.js');

var SIZE_DEFAULT = {
	WIDTH: 80,
	HEIGHT: 40
};

var Size = function (width, height) {
	this.width = width || SIZE_DEFAULT.WIDTH;
	this.height = height || SIZE_DEFAULT.HEIGHT;
};
var ScreenElement = function (character, fgcolor, bgcolor) {
	this.character = character.charAt(0) || ' ';
	this.fgcolor = isNaN(fgcolor) ? null : parseInt(fgcolor);
	this.bgcolor = isNaN(bgcolor) ? null : parseInt(bgcolor);
};

var ScreenBuffer = function (w, h) {
	var self = this;
	self.size = new Size(w, h);
	self.buffer = [];

	self.init = function () {
		for (var i = 0; i < this.size.height; i++) {
			this.buffer[i] = [];
			for (var j = 0; j < this.size.width; j++) {
				this.buffer[i][j] = new ScreenElement(' ');
			}
		}
	};

	self.changeElement = function (x, y, screenElement) {
		if (x > self.size.width || y > self.size.height) {
			throw 'Change charater coordianate is out of bounds x:' + x + ' y:' + y;
		}
		if (x < 0 || y < 0) {
			throw 'Change charater coordiante is must be a positive number x:' + x + ' y:' + y;
		}
		if (!(screenElement instanceof ScreenElement)) {
			throw '3rd arument must be an instance of ScreenElement:';
		}
		self.updated = true;
		try {
			self.buffer[y][x] = screenElement;
		} catch (e) {
			throw 'Could not set element to x: ' + x + ' y: ' + y;
		}
	};

	self.putString = function (dimensions, string, fbcolor, bgcolor) {
		var x = dimensions.x,
			y = dimensions.y;
		var w = dimensions.w,
			h = dimensions.h;
		var length = string.length;
		var org_y = y;
		for (var i = 0, j = x; i < length; i++) {
			if (j >= self.size.width || j >= w + x) {
				j = x;
				y++;
				if (y >= self.size.height || y >= h + org_y) {
					return false;
				}
			}
			self.changeElement(j++, y, new ScreenElement(string.charAt(i)));
		}
	};

	self.drawBox = function (dimensions) {
		var x = dimensions.x,
			y = dimensions.y;
		var w = dimensions.w - 1,
			h = dimensions.h - 1;
		var style = {
			left: '│',
			right: '│',
			top: '─',
			bottom: '─',

			top_left: '┌',
			top_right: '┐',
			bottom_left: '└',
			bottom_right: '┘'
		};

		for (var xx = x + 1; xx < x + w; xx++) {
			self.changeElement(xx, y, new ScreenElement(style.top));
			self.changeElement(xx, y + h, new ScreenElement(style.bottom));
		}
		for (var yy = y + 1; yy < y + h; yy++) {
			self.changeElement(x, yy, new ScreenElement(style.left));
			self.changeElement(x + w, yy, new ScreenElement(style.right));
		}
		self.changeElement(x, y, new ScreenElement(style.top_left));
		self.changeElement(x, y + h, new ScreenElement(style.bottom_left));
		self.changeElement(x + w, y, new ScreenElement(style.top_right));
		self.changeElement(x + w, y + h, new ScreenElement(style.bottom_right));
	};

	self.drawTextBox = function (dimensions, string, colors) {
		self.drawBox(dimensions);
		self.putString({
			x: dimensions.x + 1,
			y: dimensions.y + 1,
			w: dimensions.w - 2,
			h: dimensions.h - 2
		}, string);
	};
	self.init();
	this.updated = true;
};

var WindowManager = function () {
	var selectedField = -1;
	var currentLayer = 0; //Current layer, where controls act, also it is brought forth
	var WindowDescription = function () {};
};

function test() {
	var renderer = new term.ScreenRenderer();
	var scrnBuf = new ScreenBuffer(renderer.size.width, renderer.size.height);

	renderer.drawDiff(scrnBuf);
	var ss = term.getScreenSize();
	interface.Base.set_window_size(ss.w, ss.h);

	var base = new interface.Layout();
	base.size.w = 45;
	base.style = 'base';
	var base_style = new interface.Style();
	base_style.id = 'base';
	//	base_style.border.show=false;
	base_style.add();
	var lay = new interface.Layout();
	lay.pos.x = 11;
	lay.pos.y = 25;
	base.children.add(lay);
	var l1 = new interface.Field();
	l1.content = '_ohr_wooowoowowow';
	l1.id = 'tt';
	l1.pos.x = 4;
	lay.children.add(l1);
	var nbs = new interface.Style();
	base.doLayout();

	function drawBase(e) {
		var inf = e.get_draw_info();
		var style = interface.Style.get_by_id(e.style);
		//		if(inf.w <0)inf.w=maxX;
		//		if(inf.h <0)inf.h=maxY;
		if (e.content) {
			if (style.border.show) {
				scrnBuf.drawTextBox(inf, e.content);
			} else {
				scrnBuf.putString(inf, e.content);
			}
		} else {
			if (style.border.show) {
				scrnBuf.drawBox(inf);
			}
		}
	}
	setInterval(function () {
		base.render(drawBase);
		renderer.drawDiff(scrnBuf);
	}, 33);
}
test();

var listenKeys = new term.listenKeys();
listenKeys.on('input', function (input) {
	//process.stdout.write(input);
});
