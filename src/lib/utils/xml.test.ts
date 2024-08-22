import { describe, expect, it } from 'vitest';

import {
	formatXml,
	parseXml,
	type ParsedXmlNodes,
	formatComment,
	mergeParsedXml,
	getElementFromParsedXml,
	findPossibleMergePositions,
	parseXMLArray,
	formatXMLArray
} from './xml';

describe('parseXMLArray', () => {
	it('parses number XML array', () => {
		expect(parseXMLArray('{1,2,3}')).toEqual([1, 2, 3]);
	})
	it('parses float XML array', () => {
		expect(parseXMLArray('{1.1,2.2,3.3}')).toEqual([1.1, 2.2, 3.3]);
	});
	it('parses string XML array', () => {
		expect(parseXMLArray('{a,b,c}')).toEqual(['a', 'b', 'c']);
	})
	it('parses scientific notation number XML array', () => {
		expect(parseXMLArray('{1e-3,2e-3,3e-3}')).toEqual(["1e-3", "2e-3", "3e-3"]);
	});
	it('parses mixed standard notation and scientific notation number XML array', () => {
		expect(parseXMLArray('{1,2e-3,3}')).toEqual([1, "2e-3", 3]);
	});
	it('parses 2d number XML array', () => {
		expect(parseXMLArray('{{1,2},{3,4}}')).toEqual([[1, 2], [3, 4]]);
	});
	it('parses 3d number XML array', () => {
		expect(parseXMLArray('{{{1,2},{3,4}},{{5,6},{7,8}}}')).toEqual([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
	});
	it('returns undefined if not a valid XML array', () => {
		expect(parseXMLArray('1,2,3')).toBeUndefined();
	});
	it('returns undefined if not a valid XML array', () => {
		expect(parseXMLArray('{1,2,3')).toBeUndefined();
	});
	it('returns undefined if not a valid XML array', () => {
		expect(parseXMLArray('{1,2,3}}')).toBeUndefined();
	});
	it('returns undefined if not a valid XML array', () => {
		expect(parseXMLArray('{1,2,3,}')).toBeUndefined();
	});
	it('parsed mixed int and float XML array', () => {
		expect(parseXMLArray('{0,0,-9.81}')).toEqual([0, 0, -9.81]);
	});
})
describe('formatXMLArray', () => {
	it('formats number XML array', () => {
		expect(formatXMLArray([1, 2, 3])).toEqual('{1,2,3}');
	})
	it('formats float XML array', () => {
		expect(formatXMLArray([1.1, 2.2, 3.3])).toEqual('{1.1,2.2,3.3}');
	});
	it('formats string XML array', () => {
		expect(formatXMLArray(['a', 'b', 'c'])).toEqual('{a,b,c}');
	})
	it('formats scientific notation number XML array', () => {
		expect(formatXMLArray(["1e-3", "2e-3", "3e-3"])).toEqual('{1e-3,2e-3,3e-3}');
	});
	it('formats mixed standard notation and scientific notation number XML array', () => {
		expect(formatXMLArray([1, "2e-3", 3])).toEqual('{1,2e-3,3}');
	});
	it('formats 2d number XML array', () => {
		expect(formatXMLArray([[1, 2], [3, 4]])).toEqual('{{1,2},{3,4}}');
	});
	it('formats 3d number XML array', () => {
		expect(formatXMLArray([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])).toEqual('{{{1,2},{3,4}},{{5,6},{7,8}}}');
	});
});
describe('parseXml', () => {
	it('parses basic xml', () => {
		const xml = `<root><child>test text</child></root>`;
		const parsed = parseXml(xml);
		const expected: ParsedXmlNodes = [
			{
				root: [
					{
						child: [
							{
								'#text': 'test text'
							}
						]
					}
				]
			}
		];
		expect(parsed).toEqual(expected);
	});

	it('parses xml with attributes', () => {
		const xml = `<root a="1" b="2"><child>test text</child></root>`;
		const parsed = parseXml(xml);
		const expected: ParsedXmlNodes = [
			{
				root: [
					{
						child: [
							{
								'#text': 'test text'
							}
						]
					}
				],
				':@': {
					a: '1',
					b: '2'
				}
			}
		];
		expect(parsed).toEqual(expected);
	});

	it('parses xml with comments', () => {
		const xml = `<!-- comment --><root><child>test text</child></root>`;
		const parsed = parseXml(xml);
		const expected: ParsedXmlNodes = [
			{
				'#comment': [
					{
						'#text': ' comment '
					}
				]
			},
			{
				root: [
					{
						child: [
							{
								'#text': 'test text'
							}
						]
					}
				]
			}
		];
		expect(parsed).toEqual(expected);
	});
});

describe('formatComment', () => {
	it('formats comment', () => {
		const comment = 'test comment';
		const formatted = formatComment(comment);
		const expected = `<!-- test comment -->`;
		expect(formatted).toEqual(expected);
	});
	it('formats comment and trims spaces', () => {
		const comment = ' test comment   ';
		const formatted = formatComment(comment);
		const expected = `<!-- test comment -->`;
		expect(formatted).toEqual(expected);
	});
	it('formats comments and preserves inner new lines', () => {
		const comment = 'test\ncomment';
		const formatted = formatComment(comment);
		const expected = `<!-- test\ncomment -->`;
		expect(formatted).toEqual(expected);
	});
});

const typesPaths: Map<string, string[][]> = new Map(
	Object.entries({
		Z: [[]],
		a: [['Z']],
		a1: [['Z', 'a']],
		a12: [['Z', 'a', 'a1']],
		a2: [['Z', 'a']],
		b: [['Z']],
		b1: [['Z', 'b']]
	})
);

describe('getElementFromParsedXml', () => {
	it('gets element from parsed xml', () => {
		const xml: ParsedXmlNodes = [
			{
				Z: [{ a: [{ a1: [{ a12: [] }] }] }, { b: [{ b1: [] }] }]
			}
		];
		const element = getElementFromParsedXml(xml[0]);
		const expected = 'Z';
		expect(element).toEqual(expected);
	});
	it('null if no element found', () => {
		const xml: ParsedXmlNodes = [{}];
		expect(getElementFromParsedXml(xml[0])).toBeNull();
	});
});

const cursorTag = 'curssoooor';

describe('findPossibleMergePositions', () => {
	it('finds possible merge positions', () => {
		const baseXml: ParsedXmlNodes = [
			{
				Z: [{ a: [{ a1: [{ a12: [] }] }] }, { b: [{ b1: [] }] }]
			}
		];
		const expected: ReturnType<typeof findPossibleMergePositions> = [
			{ path: [{ pos: 0, key: 'Z' }], withCursor: false }
		];
		expect(findPossibleMergePositions({ baseXml, element: 'b', typesPaths, cursorTag })).toEqual(
			expected
		);
	});

	it('finds possible merge positions even if it is several layers deep', () => {
		const baseXml: ParsedXmlNodes = [
			{
				Z: [{ a: [{ a1: [{ a12: [] }] }] }, { b: [{ b1: [] }] }]
			}
		];
		const expected: ReturnType<typeof findPossibleMergePositions> = [
			{
				path: [
					{ pos: 0, key: 'Z' },
					{ pos: 0, key: 'a' },
					{ pos: 0, key: 'a1' }
				],
				withCursor: false
			}
		];
		expect(findPossibleMergePositions({ baseXml, element: 'a12', typesPaths, cursorTag })).toEqual(
			expected
		);
	});
	it('finds possible two possible merge positions and which one contains a cursor', () => {
		const baseXml: ParsedXmlNodes = [
			{
				Z: [{ a: [{ a1: [{ a12: [] }] }] }, { b: [{ b1: [] }] }, { a: [], cursor: [] }]
			}
		];
		const expected: ReturnType<typeof findPossibleMergePositions> = [
			{
				path: [
					{ pos: 0, key: 'Z' },
					{ pos: 0, key: 'a' },
					{ pos: 0, key: 'a1' }
				],
				withCursor: false
			},
			{
				path: [
					{ pos: 0, key: 'Z' },
					{ pos: 2, key: 'a' }
				],
				withCursor: true
			}
		];
		expect(
			findPossibleMergePositions({ baseXml, element: 'a12', typesPaths, cursorTag: 'cursor' })
		).toEqual(expected);
	});
});

describe('mergeParsedXml', () => {
	it('merges parsed xml', () => {
		const baseXml: ParsedXmlNodes = [
			{
				Z: [{ a: [{ a1: [{ a12: [], ':@': { name: 'a12' } }] }] }, { b: [{ b1: [] }] }]
			}
		];
		const newXml: ParsedXmlNodes = [{ a1: [{ a12: [], ':@': { name: 'a12bis' } }] }];
		const expected: ParsedXmlNodes = [
			{
				Z: [
					{
						a: [
							{
								a1: [
									{ a12: [], ':@': { name: 'a12' } },
									{ a12: [], ':@': { name: 'a12bis' } }
								]
							}
						]
					},
					{ b: [{ b1: [] }] }
				]
			}
		];
		expect(mergeParsedXml({ baseXml, newXml, typesPaths })).toEqual(expected);
	});
});

describe('formatXML', () => {
	it('formats XML', () => {
		const xml = `<root><child></child></root>`;
		const formatted = formatXml({ xml, indent: 2 });
		const expected = `<root>\n  <child />\n</root>\n`;
		expect(formatted).toEqual(expected);
	});
	it('formats XML with one element', () => {
		const xml = '<root></root>';
		const formatted = formatXml({ xml, indent: 2 });
		const expected = '<root />\n';
		expect(formatted).toEqual(expected);
	});
	//     it("preserves comments", () => {
	//         const xml = `<!-- comment --><root><child>text</child></root>`;
	//         const formatted = formatXml({ xml, indent: 2 });
	//         const expected = `<!-- comment -->\n<root>\n  <child>text</child>\n</root>`;
	//         expect(formatted).toEqual(expected)
	//     });

	//     it("sorts attributes alphabetically", () => {
	//         const xml = `<root b="2" a="1"><child>text</child></root>`;
	//         const formatted = formatXml({ xml, indent: 2 });
	//         const expected = `<root a="1" b="2">\n  <child>text</child>\n</root>`;
	//         expect(formatted).toEqual(expected)
	//     });

	//     it("puts each attribute on a new line", () => {
	//         const xml = `<root b="2" a="1"><child>text</child></root>`;
	//         const sizeIndent = 2;
	//         const _ = " ".repeat(sizeIndent)
	//         const formatted = formatXml({ xml, indent: sizeIndent });
	//         const expected = `
	// <root
	// ${_}a="1"
	// ${_}b="2"
	// >
	// ${_}<child>
	// ${_}${_}text
	// ${_}</child>
	// </root>`;
	//         expect(formatted).toEqual(expected)
});
