/**
 * Functions and types to parse XML schema definitions (ie. .xsd files).
 * @module
 */

import init, { parse_xsd } from '@selenite/commons-rs';
import { isBrowser } from './html.svelte';

/**
 * A simple datatype in an XML schema.
 */
export type SimpleType = {
	/** Name of the simple type. */
	name: string;
	/** Documentation of the simple type. Extracted from comments or annotations. */
	doc?: string;
	/** Regex to validate the type. */
	pattern?: string;
	/** Options if type is an enum. */
	options?: string[];
};

/**
 * An attribute of a complex type in an XML schema.
 */
export type Attribute = {
	/** Name of the attribute. */
	name: string;
	/** Default value of the attribute. */
	default: unknown;
	/** Documentation of the attribute. Extracted from comment or annotation. */
	doc?: string;
	/** Data type of the attribute. */
	type: string;
	/** Is the attribute required. */
	required: boolean;
};

export type ChildProps = {
	type: string;
	minOccurs?: number
	maxOccurs?: number
};


/** A complex type in an XML schema definition.
 */
export type ComplexType = {
	/** Name of the complex type. */
	name: string;
	/** Documentation of the complex type. */
	doc?: string;
	/** Attributes of the complex type. */
	attrs: Attribute[];
	attributes: Map<string, Attribute>;
	children: ChildProps[];
	childTypes: ChildProps[];
};

/**
 * A tree view of an XML schema.
 *
 * It is a recursive structure that represents the hierarchy of types in a schema.
 */
export type XMLTypeTree = { [key: string]: XMLTypeTree | 'recursive' };

/** Type alias to make code more explicit. */
export type XMLTypeName = string;
/**
 * Type of an XML schema definition.
 *
 * It defines the types allowed in an xml file, usually derived from an xsd file.
 */
export class XmlSchema {
	/** Simple types of the xml schema. */
	simpleTypes: Map<string, SimpleType> = new Map();
	/** Complex types of the xml schema. */
	complexTypes: Map<string, ComplexType> = new Map();

	/** Map which associates the names of simple XML types to their definition. */
	get simpleTypeMap(): Map<XMLTypeName, SimpleType> {
		return this.simpleTypes;
	}

	/** Map which associates the names of complex XML types to their definitions. */
	get typeMap(): Map<XMLTypeName, ComplexType> {
		return this.complexTypes;
	}

	/** Map which associates the names of complex XML types to their parents' names. */
	get parentsMap(): Map<XMLTypeName, XMLTypeName[]> {
		const res = new Map<string, string[]>();
		for (const { name } of this.complexTypes.values()) {
			res.set(name, []);
		}
		for (const { name: parentName, children } of this.complexTypes.values()) {
			if (!children) continue;
			for (const c of children) {
				res.get(c.type)!.push(parentName);
			}
		}
		return res;
	}

	/** Roots of the XML schema. */
	get roots() {
		const res = [];
		for (const [name, children] of this.parentsMap.entries()) {
			if (children.length === 0) res.push(name);
		}
		return res;
	}

	/**
	 * Tree representation of the XML schema.
	 *
	 * It is a recursive structure that represents the hierarchy of the types in the schema.
	 */
	get tree(): XMLTypeTree {
		const res: XMLTypeTree = {};
		const rec = (current: XMLTypeTree, types: XMLTypeName[], already_visited: XMLTypeName[]) => {
			// const isOneTypeAlreadyVisited = types.some((t) => already_visited.includes(t));
			for (const type of types) {
				if (already_visited.includes(type)) {
					current[type] = 'recursive';
					continue;
				}
				current[type] = {};
				const children = this.typeMap.get(type)?.children.map(c => c.type);
				if (!children) continue;
				rec(current[type], children, [...already_visited, type]);
			}
		};

		rec(res, this.roots, []);
		return res;
	}

	/**
	 * Map which associates the names of complex XML types to their possible paths in an XML file.
	 *
	 * The paths are represented as an array of type names.
	 * If a type is recursive, the value is 'infinite'.
	 */
	get typePaths(): Map<XMLTypeName, XMLTypeName[][] | 'infinite'> {
		const res = new Map<XMLTypeName, XMLTypeName[][] | 'infinite'>();

		const rec = (tree: XMLTypeTree, path: XMLTypeName[]) => {
			for (const [name, children] of Object.entries(tree)) {
				if (children === 'recursive') {
					res.set(name, 'infinite');
					continue;
				}
				const paths = res.get(name);
				if (paths === 'infinite') continue;

				res.set(name, [...(paths || []), path]);
				rec(children, [...path, name]);
			}
		};
		rec(this.tree, []);

		return res;
	}
}

/**
 * Parses an XML schema from an XSD string.
 * @param xsd - xsd string
 * @returns XMLSchema, or undefined if the string could not be parsed
 */
export async function parseXsd(xsd: string): Promise<XmlSchema | undefined> {
	if (!isBrowser()) return;
	await init();
	const schema = parse_xsd(xsd);

	if (!schema) return;

	const res: XmlSchema = new XmlSchema();

	for (const { name, doc, options, pattern } of schema.simple_types) {
		res.simpleTypes.set(name, {
			name,
			doc,
			pattern,
			options
		});
	}

	for (const { name, children, fields, doc } of schema.complex_types) {
		const attrs = fields.map(({ name, doc, type_name: type, required, default: default_ }) => {
			if (default_) {
				try {
					default_ = JSON.parse(default_);
				} catch (e) {}
			}
			return {
				name,
				type,
				required,
				default: default_,
				doc
			};
		});
		res.complexTypes.set(name, {
			name,
			get attrs() {
				return Object.values(this.attributes) as Attribute[];
			},
			attributes: new Map(attrs.map((a) => [a.name, a])),
			get childTypes() {
				return this.children;
			},
			doc,
			children: children?.map(c => ({type: c.type_name, maxOccurs: c.max_occurs, minOccurs: c.min_occurs})) ?? []
		});
	}
	schema.free();
	return res;
}

/**
 * Parses an XML schema from the url of an XSD file.
 * @param url - url of the xsd file
 * @returns XMLSchema, or undefined if the file could not be fetched or parsed
 */
export async function parseXsdFromUrl(url: string): Promise<XmlSchema | undefined> {
	if (!isBrowser()) return;
	const res = await fetch(url);
	const xsd = await res.text();
	return parseXsd(xsd);
}
