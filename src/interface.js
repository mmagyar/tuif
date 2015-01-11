var common = require('./common.js');
var Contained_style;

function add_container(element) {
	var container = [];
	element.prototype.get_container = function () {
		return container;
	};
	element.prototype.add = function () {
		return container.push(this) - 1;
	};
	element.prototype.remove = function (id_or_container) {
		function remove(to_remove) {
			var index;
			var counter = 0;
			while ((index = container.indexOf(to_remove)) !== -1) {
				container.splice(index, 1);
				counter++;
			}
			return counter;
		}
		if (this instanceof element) {
			return remove(this);
		} else if (container instanceof element) {
			return remove(id_or_container);
		} else {
			for (var i = 0, l = container.length; i < l; i++) {
				if (container[i].id === id_or_container) {
					return remove(container[i]);
				}
			}
		}
		return -1;
	};
	var iterator = function (callback) {
		container.forEach(callback);
	};
	element.iterate = iterator;
	element.prototype.iterator = iterator;
	element.get_by_id = function (id) {
		for (var i = 0, l = container.length; i < l; i++) {
			if (container[i].id === id) {
				return container[i];
			}
		}
		return null;
	};
	return element;
}
var Base = function () {
	var self = this;
	self.pos = {
		x: 0,
		y: 0,
		unit: 'unit'
	};
	self.size = {
		w: 10,
		h: 10,
		unit: 'fill'
	};
	self.get_draw_info = function (internal) {
		var x = self.pos.x;
		var y = self.pos.y;
		var w = self.size.w;
		var h = self.size.h;
		if (self.parent !== null) {
			var style = Contained_style.get_by_id('default');
			var m = self.parent.get_draw_info(true);
			if (style.border.show) {
				m.x++;
				m.y++;
				m.w -= 2;
				m.h -= 2;
			}
			if (m.w < w + x && m.w >= 0) w = m.w - x;
			if (m.h < h + y && m.h >= 0) h = m.h - y;
			x += m.x;
			y += m.y;
		} else if (internal) {
			return {
				x: 0,
				y: 0,
				w: -1,
				h: -1
			};
		} else {
			return {
				x: 0,
				y: 0,
				w: Base.max_width,
				h: Base.max_height
			};
		}
		return {
			x: x,
			y: y,
			w: w,
			h: h
		};
	};
	self.style = 'default';
	self.id = common.randomString(7);
	self.parent = null;
};
Base.max_width = 120;
Base.max_height = 40;
Base.set_window_size = function (w, h) {
	Base.max_width = w;
	Base.max_height = h;
	//TODO refresh layout
};
var Field = function () {
	Base.call(this);
	var self = this;
	self.content = 'default';
};
Field.prototype = Object.create(Base.prototype);
var Container = function () {
	Base.call(this);
	var self = this;
	var children_array = [];
	self.children = {
		_get_raw: function () {
			return children_array;
		},
		get: function () {
			return children_array.slice();
		},
		add: function (new_children) {
			var length = children_array.length;
			if (length >= 1 && self.layout === 'fill') {
				return false; //Fill layout can only have 1 child
			}
			//wut?
			if (!(new_children instanceof Base)) {
				return false; //you can only add insctances of Base
			}
			children_array.push(new_children);
			new_children.parent = self;
		},
		remove: function (id_or_instance) {
			if (typeof id_or_instance === 'string') {
				for (var i = 0; i < children_array.length; i++) {
					if (children_array[i].id === id_or_instance) {
						return children_array.splice(i, 1);
						//return this.remove(children_array[i]);
					}
				}
			} else if (id_or_instance instanceof Base) {
				var index = children_array.indexOf(id_or_instance);
				if (index === -1) {
					return false;
				}
				return children_array.splice(index, 1);
			}
			return false;
		}
	};
	self.render = function (draw_function) {
		draw_function(self);
		for (var i = 0; i < children_array.length; i++) {
			var cc = children_array[i];
			if (cc.render)
				cc.render(draw_function);
			else
				draw_function(cc);
		}
	};
};
Container.prototype = Object.create(Base.prototype);
var Layout = function () {
	Container.call(this);
	var self = this;
	self.layout = 'fill';
	self.doLayout = function () {
		var ch = self.children._get_raw();
		if (self.layout === 'fill') {
			var ef = self.get_draw_info();
			ch[0].pos.x = 0;
			ch[0].pos.y = 0;
			ch[0].size.w = ef.w - 2;
			ch[0].size.h = ef.h - 2;
		}
	};
};
Layout.prototype = Object.create(Container.prototype);
var Style = function () {
	var self = this;
	self.id = common.randomString();
	self.color = 1;
	self.background = 0;
	//0 = hide; 1 = only indicators in the border when needed,
	//2 = full scrollbar when needed,
	//3 = indicator always, 4 full always,
	self.scrollbar = 2;
	self.border = {
		left: '│',
		right: '│',
		top: '─',
		bottom: '─',
		top_left: '┌',
		top_right: '┐',
		bottom_left: '└',
		bottom_right: '┘',
		color: 1,
		background: 0,
		show: 1
	};
};
Contained_style = add_container(Style);
var def_style = new Contained_style();
def_style.id = 'default';
def_style.add();
exports.Style = Contained_style;
exports.Base = Base;
exports.Field = Field;
exports.Layout = Layout;
