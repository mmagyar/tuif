var common = require("./common.js");
var events = require('events');

var SIZE_DEFAULT = {
WIDTH : 80,
HEIGHT : 24
};

var Size = function(width, height) {
	this.width = width || SIZE_DEFAULT.WIDTH;
	this.height = height || SIZE_DEFAULT.HEIGHT;
};

var ANSI = {
prefix : "\x1b[",
suffix : 'm', // colors only

up : 'A',
down : 'B',
forward : 'C',
back : 'D',
nextLine : 'E',
previousLine : 'F',
horizontalAbsolute : 'G',
eraseData : 'J',
eraseLine : 'K',
scrollUp : 'S',
scrollDown : 'T',
savePosition : 's',
restorePosition : 'u',
queryPosition : '6n',
hide : '?25l',
show : '?25h',

bold : 1,
italic : 3,
underline : 4,
inverse : 7,
reset : 0,
reset_bold : 22,
reset_italic : 23,
reset_underline : 24,
reset_inverse : 27,

transparent : 30,
red : 31,
green : 32,
yellow : 33,
blue : 34,
magenta : 35,
cyan : 36,
white : 37,
grey : 90,
brightBlack : 90,
brightRed : 91,
brightGreen : 92,
brightYellow : 93,
brightBlue : 94,
brightMagenta : 95,
brightCyan : 96,
brightWhite : 97
};
exports.ANSI = ANSI;

exports.getScreenSize = function() {

	return {
	w : process.stdout.columns || SIZE_DEFAULT.WIDTH,
	h : process.stdout.rows || SIZE_DEFAULT.HEIGHT
	};
};

// Only draw differances between frames
exports.ScreenRenderer = function(w, h) {
	var self = this;
	w = process.stdout.columns || w;
	h = process.stdout.rows || h;
	this.size = new Size(w, h);

	this.prevScreen = common.prep_2d_array(this.size.height, this.size.width);

	this.drawAll = function(buffer, force) {
		clear_screen();
		for (var i = 0; i < buffer.size.height; i++) {
			for (var j = 0; j < buffer.size.width; j++) {
				process.stdout.write(buffer.buffer[i][j].character);
			}
			process.stdout.write("\n");
		}
	};

	this.drawDiff = function(buffer, force) {
		if (!buffer.updated && !force) { return; }
		var h = this.size.height < buffer.size.height ? this.size.height : buffer.size.height;
		var w = this.size.width < buffer.size.width ? this.size.width : buffer.size.width;

		for (var i = 0; i < h; i++) {
			for (var j = 0; j < w; j++) {
				if (buffer.buffer[i][j] != self.prevScreen[i][j]) {
					self.prevScreen[i][j] = buffer.buffer[i][j];
					put_char(j, i, buffer.buffer[i][j].character, buffer.buffer[i][j].fgcolor);
				}
			}
		}
		buffer.updated = false;
	};
	var clear_screen = function() {
		process.stdout.write(ANSI.prefix + "2J");
		process.stdout.write(ANSI.prefix + "1;1H");
	};
	var move_cursor = function(x, y) {
		process.stdout.write(ANSI.prefix + (y + 1) + ";" + (x + 1) + "H");
	};

	var put_color = function(color) {
		if (color >= 30 && color <= 37) process.stdout.write(ANSI.prefix + color + ANSI.suffix);
		// else
		// throw "Color: " + color + " is not a valid ansi color";
	};

	var put_char = function(x, y, character, color) {
		move_cursor(x, y);
		process.stdout.write(character);
		if (color) {
			put_color(color);
		}
	};

	clear_screen();
	process.stdout.write(ANSI.prefix + ANSI.hide);

	process.stdout.on('resize', function() {
	// console.log('screen size has changed!');
	// console.log(process.stdout.columns + 'x' + process.stdout.rows);
	});

};
exports.listenKeys = function() {
	try {
		var self = this;
		var stdin = process.stdin;
		// without this, we would only get streams once enter is pressed
		stdin.setRawMode(true);

		// resume stdin in the parent process (node app won't quit all by itself
		// unless an error or process.exit() happens)
		stdin.resume();

		// i don't want binary, do you?
		stdin.setEncoding('utf8');

		// on any data into stdin
		stdin.on('data', function(key) {
			// ctrl-c ( end of text )
			if (key === '\u0003') {
				process.stdout.write(ANSI.prefix + ANSI.reset);
				process.stdout.write("\n\r");
				process.stdout.write(ANSI.prefix + ANSI.show);
				process.exit();
			}
			self.emit("input", key);
			// write the key to stdout all normal like
			// process.stdout.write( key );
		});
	} catch (e) {

		console.error('\nstandard input is not supported on your computer, exiting: ', e);
		process.exit();
	}
	return self;
};

exports.listenKeys.prototype = Object.create(events.EventEmitter.prototype);
