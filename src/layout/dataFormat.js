//This show the data structure used for the layout,
//the separate internal format makes it possible to write adapter for different kind of elements
//extend this class with 'conversion' subclasses
function LayoutProcessObject(el) {
	//Can contain anything, it is used to hold refenece for the original object, it will not be modified
	this.el = el;
	//size in an array, 0 : width , 1: height (optional), 2 :depth (optional)
	this.size = [-1, -1];
	//if the size of this element should ne calculated dynamicly
	this.sizeDyn = [true, true];
	// minimum size, it should override size, even if fixes
	this.sizeMin = [-1, -1];
	// maximum size, ti should override minimum size
	this.sizeMax = [-1, -1];
	//the 'weight' of this element in case of dynamic layout
	this.sizeWeight = [1, 1];
	//the alignment of the object
	this.align = [-1, -1];
	//position of object
	this.pos = [0, 0];
}

LayoutProcessObject.prototype.validate = function () {
	function testFor(element, attribute, type, rejectUndefined) {
		var ela = element[attribute];
		if (typeof ela !== type && (!(ela === null || ela === undefined) || rejectUndefined)) {
			throw attribute + ' must be ' + type + (!rejectUndefined ? ',null or undefined' : '');
		}
	}

	var t = testFor.bind(this, this);
	t('width', 'number');
	t('minWidth', 'number');
	t('height', 'number');
	t('minHeight', 'number');

};


function GenericToLPO(el, forceDynamicWidth, forceDynamicHeight) {
	LayoutProcessObject.call(this, el);

	if (el.width > 0 && !forceDynamicWidth) {
		this.size[0] = el.width;
		this.sizeDyn[0] = false;
	}

	if (el.height > 0 && !forceDynamicHeight) {
		this.size[1] = el.height;
		this.sizeDyn[1] = false;
	}

	this.sizeMin[0] = el.minWidth > 0 ? el.minWidth : this.sizeMin[0];
	this.sizeMin[1] = el.minHeight > 0 ? el.minHeight : this.sizeMin[1];

	this.sizeMax[0] = el.maxWidth > 0 ? el.maxWidth : this.sizeMax[0];
	this.sizeMax[1] = el.maxHeight > 0 ? el.maxHeight : this.sizeMax[1];

	this.sizeWeight[0] = el.weightWidth > 0 ? el.weightWidth : this.sizeWeight[0];
	this.sizeWeight[1] = el.weightHeight > 0 ? el.weightHeight : this.sizeWeight[1];
	this.validate();

}
GenericToLPO.prototype = Object.create(LayoutProcessObject.prototype);


exports.GenericToLPO = GenericToLPO;