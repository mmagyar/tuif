
exports.prep_2d_array = function (x,y){

	var newArray = [];
	for (var i=0; i < x; i++){
		newArray[i] = [];
		for (var j=0; j < y; j++){
			newArray[i][j] = null;
		}
	}
	return newArray;
};

exports.Dim = function (x,y,w,h) {
	var self = this;
	self.x = x || 0;
	self.y = y || 0;
	self.w = w || 0;
	self.h = h || 0;
};

exports.checkType =function (variable, type) {
	if (!(variable instanceof type)){
		throw "The arugment must be and instance of type: " + type;
	}
	return 0;
};
exports.randomString = function (L){
	var s= '';
	var randomchar=function(){
		var n= Math.floor(Math.random()*62);
		if(n<10) return n; //1-10
		if(n<36) return String.fromCharCode(n+55); //A-Z
		return String.fromCharCode(n+61); //a-z
	};
	while(s.length< L) s+= randomchar();
	return s;
};
