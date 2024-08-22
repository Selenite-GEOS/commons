/**
 * Utils to parse, format and write XML.
 * @module
 */

import { type X2jOptions, XMLParser, type XmlBuilderOptions } from 'fast-xml-parser';
import { isEqual } from 'lodash-es';
import 'regenerator-runtime/runtime';
import wu from 'wu';
import type { XmlSchema } from './xsd';

export function parseXMLArray(xml: string): unknown[] | undefined {
	try {
		return JSON.parse(
			xml
				.replaceAll('{', '[')
				.replaceAll('}', ']')
				.replaceAll(/[a-zA-Z0-9.\-_/]+/g, (t) => {
					if (!isNaN(parseFloat(t)) && !t.includes('e')) return t;
					// if (t === '') return '';
					// if (t === ',') return ',';
					return `"${t}"`;
				})
		);
	} catch (e) {
		return undefined;
	}
}

export function formatXMLArray(arr: unknown[]): string {
	return JSON.stringify(arr)
		.replaceAll('[', '{')
		.replaceAll(']', '}')
		.replaceAll(/"([^"]+)"/g, '$1');
}

const fxpSettings: X2jOptions & XmlBuilderOptions = {
	preserveOrder: true,
	attributeNamePrefix: '',
	ignoreAttributes: false,
	commentPropName: '#comment',
	parseAttributeValue: false,
	trimValues: true,
	format: true,
	ignoreDeclaration: false
};

function parseXml(xml: string): ParsedXmlNodes {
	const parser = new XMLParser({
		...fxpSettings
	});
	const parsed = parser.parse(xml) as ParsedXmlNodes;
	return parsed;
}

export function buildXml({
	parsedXml,
	indent = 2,
	baseSpace = '',
	cursorTag,
	endWithNewLine = true
}: {
	parsedXml: ParsedXmlNodes;
	indent?: number;
	baseSpace?: string;
	cursorTag?: string;
	endWithNewLine?: boolean;
}): string {
	const space = ' '.repeat(indent);
	const res: { xml: string; newLine?: boolean }[] = [];
	for (const element of parsedXml) {
		const attrs: string[] = [];
		let tag = '';
		let childXml = '';
		for (const [key, props] of Object.entries(element)) {
			if (key === cursorTag) continue;
			switch (key) {
				case cursorTag:
					break;
				case '#comment':
					res.push({ xml: `${baseSpace}<!--${props[0]['#text']}-->` });
					break;
				case ':@':
					for (const [attr, value] of Object.entries(props as ParsedXmlAttribute)) {
						attrs.push(`${baseSpace}${space}${attr}="${value}"`);
					}
					break;
				case '#text':
					break;
				default:
					tag = key;
					const children = props as ParsedXmlNodes;
					childXml = buildXml({
						parsedXml: children,
						indent,
						baseSpace: baseSpace + space,
						cursorTag,
						endWithNewLine: false
					});
					break;
			}
		}
		const preppedAttrs =
			attrs.length > 1 ? `\n${attrs.join('\n')}` : attrs.length === 1 ? ` ${attrs[0].trim()}` : '';
		if (tag)
			if (childXml.length === 0)
				res.push({
					xml:
						baseSpace +
						`<${tag}${preppedAttrs}${tag === '?xml' ? '?' : ' /'}>${tag === '?xml' ? '\n' : ''}`,
					newLine: attrs.length > 1
				});
			else
				res.push({
					xml: `${baseSpace}<${tag}${preppedAttrs}>\n${childXml}${
						childXml.at(-1) !== '\n' ? '\n' : ''
					}${baseSpace}</${tag}>`,
					newLine: true
				});
	}
	let xml = wu(res)
		.map(({ xml, newLine }) => (newLine ? xml + '\n' : xml))
		.reduce((a, b) => a + (a ? '\n' : '') + b, '');

	if (endWithNewLine && xml.at(-1) !== '\n') xml += '\n';
	return xml;
}

export function getElementFromParsedXml(xml: Record<string, unknown>): string | null {
	for (const key in xml) {
		if ([':@', '#text', '#comment'].includes(key)) continue;
		return key;
	}
	return null;
}

/**
 * Returns the different paths to the possible merge positions
 * @param param0
 * @returns
 */
export function findPossibleMergePositions({
	baseXml,
	element,
	typesPaths,
	cursorTag
}: {
	baseXml: ParsedXmlNodes;
	element: string;
	typesPaths: XmlSchema['typePaths'];
	cursorTag?: string;
}): { path: { pos: number; key: string }[]; withCursor: boolean }[] {
	type T = ReturnType<typeof findPossibleMergePositions>[number];

	function rec(elementPath: string[], path: T, xml: ParsedXmlNodes): T[] {
		if (elementPath.length === 0)
			return [{ ...path, withCursor: cursorTag ? path.withCursor || cursorTag in xml : false }];

		const possiblePathsEntryPoints = xml.filter(
			(xmlNode) => getElementFromParsedXml(xmlNode) === elementPath[0]
		);
		if (possiblePathsEntryPoints.length === 0) {
			return [{ ...path, withCursor: cursorTag ? path.withCursor || cursorTag in xml : false }];
		}

		return wu(xml.entries())
			.filter(([i, xmlNode]) => getElementFromParsedXml(xmlNode) === elementPath[0])
			.map(([i, xmlNode]) =>
				rec(
					elementPath.slice(1),
					{
						path: [...path.path, { pos: i, key: getElementFromParsedXml(xmlNode)! }],
						withCursor: cursorTag ? path.withCursor || cursorTag in xml[i] : false
					},
					(xml[i] as Record<string, ParsedXmlNodes>)[getElementFromParsedXml(xml[i])!]
				)
			)
			.reduce((a, b) => [...a, ...b], []);
	}
	const path = typesPaths.get(element);
	if (!path) {
		console.error("Couldn't find type path");
		return [];
	}
	if (path === 'infinite') {
		console.error("Don't know where to insert element with infinite possibilities.");
		return [];
	}
	if (path.length > 1) {
		console.error('Mutltiple possible paths not handled');
		return [];
	}

	return rec(path.at(0) ?? [], { path: [], withCursor: false }, baseXml);
}

export function getXmlAttributes(xml: {
	[key: string]: ParsedXmlNodes | ParsedXmlNode[] | ParsedXmlAttribute | undefined;
	':@'?: ParsedXmlAttribute | undefined;
}): Record<string, string> {
	return ':@' in xml ? (xml[':@'] as Record<string, string>) : {};
}

function mergeRec(base: Record<string, ParsedXmlNodes>[], toAdd: Record<string, ParsedXmlNodes>[]) {
	wu(toAdd).forEach((xmlNode) => {
		const key = getElementFromParsedXml(xmlNode);
		if (!key) return;
		const elementMergeCandidate = wu(base)
			.filter((base_xmlNode) => getElementFromParsedXml(base_xmlNode) == key)
			.take(1)
			.toArray()
			.at(0);

		if (
			elementMergeCandidate &&
			!('name' in getXmlAttributes(elementMergeCandidate)) &&
			isEqual(getXmlAttributes(elementMergeCandidate), getXmlAttributes(xmlNode))
		)
			mergeRec(
				elementMergeCandidate[key] as Record<string, ParsedXmlNodes>[],
				xmlNode[key] as Record<string, ParsedXmlNodes>[]
			);
		else return base.push(xmlNode);
	});
}
export function mergeParsedXml({
	baseXml,
	newXml,
	typesPaths,
	cursorTag
}: {
	baseXml: ParsedXmlNodes;
	newXml: ParsedXmlNodes;
	cursorTag?: string;
	typesPaths: XmlSchema['typePaths'];
}): ParsedXmlNodes {
	const res = JSON.parse(JSON.stringify(baseXml)) as ParsedXmlNodes;
	wu(newXml).forEach((newXmlNode) => {
		const element = getElementFromParsedXml(newXmlNode);
		if (!element) return;
		const mergePositions = findPossibleMergePositions({ baseXml, element, typesPaths, cursorTag });

		if (mergePositions.length === 0) throw new Error('No merge position found');
		let selectedMergePosition = mergePositions[0];

		if (mergePositions.length > 1) {
			selectedMergePosition = wu(mergePositions)
				.filter(({ withCursor }) => withCursor)
				.reduce((a, b) => {
					if (a !== undefined) throw new Error('Too many selected merge positions');
					return b;
				}, undefined);
		}

		const elementPath = typesPaths.get(element);
		if (!elementPath) {
			console.error("Couldn't find type path");
			return;
		}
		if (elementPath === 'infinite') {
			console.error("Don't know where to insert element with infinite possibilities.");
			return;
		}
		if (elementPath.length > 1) {
			console.error('Mutltiple possible paths not handled');
			return;
		}
		const mergePath = selectedMergePosition.path;
		const target = wu(mergePath).reduce(
			({ ePath, base }, mergePathStep) => {
				return {
					base: (base[mergePathStep.pos] as Record<string, ParsedXmlNodes>)[mergePathStep.key],
					ePath: ePath.slice(1)
				};
			},
			{ ePath: elementPath.at(0) ?? [], base: res }
		);
		let toGlue = newXmlNode;
		for (const step of target.ePath.toReversed()) {
			toGlue = {
				[step]: [toGlue]
			};
		}
		// Now we have a glue path ready, we can merge
		// We have to find the elements that can be merged like identic tags and attributes,
		// without names

		mergeRec(target.base as Record<string, ParsedXmlNodes>[], [
			toGlue as Record<string, ParsedXmlNodes>
		]);
	});
	return res;
}

function formatXml({ xml, indent = 2 }: { xml: string; indent?: number }): string {
	const parsedXml = parseXml(xml);
	return buildXml({ parsedXml, indent });
}

function formatComment(comment: string): string {
	return `<!-- ${comment.trim()} -->`;
}

type ParsedXmlAttribute = Record<string, string>;

type ParsedXmlNode = {
	'#text'?: string;
	[key: string]: ParsedXmlAttribute | Array<ParsedXmlNode> | string | undefined;
};

type parsedXmlComment = {
	'#comment': string;
};

type ParsedXmlNodes = Array<
	| parsedXmlComment
	| {
			':@'?: ParsedXmlAttribute;
			[key: string]: ParsedXmlNodes | Array<ParsedXmlNode> | ParsedXmlAttribute | undefined;
	  }
>;

export type { ParsedXmlNodes, ParsedXmlNode, parsedXmlComment, ParsedXmlAttribute };
export { parseXml, formatXml, formatComment };
