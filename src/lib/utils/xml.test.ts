import { assert, describe, it } from 'vitest';
import {
	formatXml,
	parseXml,
	type ParsedXmlNodes,
	formatComment,
	mergeParsedXml,
	getElementFromParsedXml,
	findPossibleMergePositions
} from './xml';

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
		assert.deepEqual(parsed, expected);
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
		assert.deepEqual(parsed, expected);
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
		assert.deepEqual(parsed, expected);
	});
});

describe('formatComment', () => {
	it('formats comment', () => {
		const comment = 'test comment';
		const formatted = formatComment(comment);
		const expected = `<!-- test comment -->`;
		assert.equal(formatted, expected);
	});
	it('formats comment and trims spaces', () => {
		const comment = ' test comment   ';
		const formatted = formatComment(comment);
		const expected = `<!-- test comment -->`;
		assert.equal(formatted, expected);
	});
	it('formats comments and preserves inner new lines', () => {
		const comment = 'test\ncomment';
		const formatted = formatComment(comment);
		const expected = `<!-- test\ncomment -->`;
		assert.equal(formatted, expected);
	});
});

const typesPaths: Map<string, string[][]> = new Map(Object.entries({
	Z: [[]],
	a: [['Z']],
	a1: [['Z', 'a']],
	a12: [['Z', 'a', 'a1']],
	a2: [['Z', 'a']],
	b: [['Z']],
	b1: [['Z', 'b']]
}));

describe('getElementFromParsedXml', () => {
	it('gets element from parsed xml', () => {
		const xml: ParsedXmlNodes = [
			{
				Z: [{ a: [{ a1: [{ a12: [] }] }] }, { b: [{ b1: [] }] }]
			}
		];
		const element = getElementFromParsedXml(xml[0]);
		const expected = 'Z';
		assert.equal(element, expected);
	});
	it('null if no element found', () => {
		const xml: ParsedXmlNodes = [
			{
			}
		];
		assert.isNull(getElementFromParsedXml(xml[0]));
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
		assert.deepEqual(
			findPossibleMergePositions({ baseXml, element: 'b', typesPaths, cursorTag }),
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
		assert.deepEqual(
			findPossibleMergePositions({ baseXml, element: 'a12', typesPaths, cursorTag }),
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
		assert.deepEqual(
			findPossibleMergePositions({ baseXml, element: 'a12', typesPaths, cursorTag: 'cursor' }),
			expected
		);
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
		assert.deepEqual(
			mergeParsedXml({ baseXml, newXml, typesPaths }),
			expected
		);
	});
});

describe('formatXML', () => {
	it('formats XML', () => {
		const xml = `<root><child></child></root>`;
		const formatted = formatXml({ xml, indent: 2 });
		const expected = `<root>\n  <child />\n</root>\n`;
		assert.equal(formatted, expected);
	});
	//     it("preserves comments", () => {
	//         const xml = `<!-- comment --><root><child>text</child></root>`;
	//         const formatted = formatXml({ xml, indent: 2 });
	//         const expected = `<!-- comment -->\n<root>\n  <child>text</child>\n</root>`;
	//         assert.equal(formatted, expected);
	//     });

	//     it("sorts attributes alphabetically", () => {
	//         const xml = `<root b="2" a="1"><child>text</child></root>`;
	//         const formatted = formatXml({ xml, indent: 2 });
	//         const expected = `<root a="1" b="2">\n  <child>text</child>\n</root>`;
	//         assert.equal(formatted, expected);
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
	//         assert.equal(formatted, expected);
});
