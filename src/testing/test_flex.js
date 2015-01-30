var tester = require('./tester.js');
var flex = require('../layout/flex.js');

var calculateWidthLayout = (bound, children) => flex.calculateWidthLayout(bound, children);


function runTests() {
	function _T_horizontalLayout() {
		const ts = new tester.TestSuit();
		const sizeCmpFnGen = (sizesArr, msg, index) => sizesArr.map((s, i) => (items => {
			return {
				msg: msg || 'check size parameter',
				pass: items[i].size[index || 0] == s,
				result: items[i].size[index || 0],
				value: s
			};
		}));

		const genTestFn = testData => (t => calculateWidthLayout.apply(this, testData));
		const runTests = (data, expect, msg) => ts.add(genTestFn(data), sizeCmpFnGen(expect, msg));

		runTests([100, [{}, {}, {}]], [34, 33, 33]);

		const t2Data = [99, [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]];
		t2Data[1][1].maxWidth = 8;
		runTests(t2Data, [11, 8, 10, 10, 10, 10, 10, 10, 10, 10], '10 elements, 1 element with max width');

		//Test if it handles values that are too big in an accaptable way
		const t3Data = [50, [{}, {}, {}, {}, {}]];
		t3Data[1][0].width = 11;
		t3Data[1][1].minWidth = 12;
		t3Data[1][2].minWidth = 75;
		runTests(t3Data, [11, 12, 75, 1, 1], 'test handling of overflowing elements');

		const t4Data = [10, [{}, {}, {}]];
		t4Data[1][0].weightWidth = 200;
		t4Data[1][1].weightWidth = 1000;
		runTests(t4Data, [2, 7, 1], 'large weight values with small total width');

		const t5Data = [1021, [{}, {}, {}]];
		t5Data[1][0].weightWidth = 20;
		t5Data[1][1].weightWidth = 1000;
		runTests(t5Data, [20, 1000, 1]);

		runTests([Math.pow(2, 32), [{}, {}, {}]], [1431655766, 1431655765, 1431655765], 'layout with 2^32 width');
		var showW = (e) => e.size[0];

		const t7Data = [100, [{}, {}, {}]];
		t7Data[1][0].maxWidth = 20;
		t7Data[1][1].maxWidth = 22;
		t7Data[1][2].maxWidth = 24;
		runTests(t7Data, [20, 22, 24], 'test if the values have smaller cumulative with than totoal width');

		//var testResult = tester.truthTest(testRes, true);
		
		ts.run();
		
		return ts.getResult();
	}
	var tests = [];
	tests.push(_T_horizontalLayout());
	return tests;
}

if (!module.parent)
	console.log('Tests ran', runTests());