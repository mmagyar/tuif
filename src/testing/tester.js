/**
 * run a test in controlled manner
 * @param   {Boolean}        printErr       If it's a truthy value it will print the error message if a test fails
 * @param   {Function}       runTestFun     the test function that will be run, if no other arguments are given
 *                                          to this function than any truthy value will be interpreted as a test pass
 * @param   {Function|Array} testFnsVarArgs any number of functions can be given as arguments as tests,
 *                                         they must return true or false boolen, corresponding to pass or fail
 * @returns {Array|Boolean}  if running the test failed with and exception it returns false,
 *                           otherwise it returns an array corresponding to the tests and their results
 */
var runTest = function (printErr, runTestFun, testFnsVarArgs) {
	var testFnRes;
	var testResults = [];
	try {
		testFnRes = runTestFun();
	} catch (e) {
		if (printErr) console.log(e, e.stack);
		return false;
	}

	const testElements = function (element) {
		let result = null;
		try {
			result = element(testFnRes);
			if (!(typeof result === 'boolean' || (typeof result === 'object' && typeof result.pass === 'boolean'))) {
				throw new TypeError('Tests must return a boolean type or object with pass,result and value parameters');
			}
		} catch (e) {
			if (printErr) console.log(e, e.stack);
			result = false;
		}
		return result;
	};

	const fnOrArray = function (element) {
		if (typeof element === 'function') {
			testResults.push(testElements(element));
		} else if (element instanceof Array) {
			element.forEach(fnOrArray);
		} else {
			throw new TypeError(' 3rd or later arguments must be functions or array of functions');
		}

	};

	if (arguments.length <= 2) {
		testResults.push(testFnRes ? true : false);
	} else {
		for (let i = 2; i < arguments.length; i++) {
			fnOrArray(arguments[i]);
		}
		return testResults;
	}
};
//will return true if all the tests pass;
var truthTest = function (test, printError) {
	var fails = 0;
	if (test instanceof Array) {
		for (var i = 0; i < test.length; i++) {
			fails += truthTest(test[i], printError) ? 0 : 1;
		}
	} else if (typeof test === 'boolean') {
		return test;
	} else if (typeof test === 'object') {
		if (typeof test.pass === 'boolean') {
			if (!test.pass && printError) {
				var errorText = '';

				for (var e in test) {
					if (test.hasOwnProperty(e)) errorText += (errorText ? ', ' : '') + e + ' : ' + test[e];
				}
				console.log('Error in test: ' + errorText);
			}
			return test.pass;
		}
		for (var c in test) {
			if (test.hasOwnProperty(c))
				if (!truthTest(test[c], printError)) fails++;
		}
	} else {
		console.log('undefined value in test');
		return false;
	}
	if (fails) return false;
	else return true;

};
var printTests = function (tests, text, indent, num) {
	indent = indent || 0;
	num = num || 0;
	var indentText = '';
	while (indentText.length < indent * 4) indentText += ' ';
	console.log(indentText + 'Test ' + num + ' / level ' + indent + ' for: ' + text);

	var textS = (text ? ' for ' + text : '');
	textS = '';
	var biggestNum = tests.length + '';

	for (var i = 0; i < tests.length; i++) {
		if (tests[i] instanceof Array) {
			printTests(tests[i], text, indent + 1, i);
		} else {
			var numText = i + '';
			while (numText.length < biggestNum.length) numText = '0' + numText;
			console.log(indentText + '  ' + numText + ': ', tests[i]);
		}
	}
};

function TestSuit() {
	var self = this;
	self.printErrorLevel1 = true;
	self.printErrorLevel2 = true;
	var testRan = false;
	var tests = [];
	var testRes = [];

	self.add = function (testFn, resultCheckArrOrVarArgs) {
		tests.push(Array.prototype.slice.call(arguments));
	};

	self.run = function () {
		tests.forEach(function (t) {
			let arr = t.slice();
			arr.unshift(self.printErrors);
			testRes.push(runTest.apply(self, arr));
		});
		testRan = true;
	};
	self.clearAll = function () {
		testRan = false;
		tests = [];
		testRes = [];
	};

	self.clearResults = function () {
		testRan = false;
		testRes = [];
	};

	self.printResults = () => printTests(testRes);
	self.getResult = () => testRan ? truthTest(testRes) : console.log('The test must be run before getting the result');
	self.getResultArray = () => testRes.slice();
}


exports.TestSuit = TestSuit;