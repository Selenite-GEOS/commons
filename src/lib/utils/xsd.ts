import init, { parse_xsd } from 'selenite-commons-rs';
import { isBrowser } from './html';

export type SimpleType = {
	name: string;
	doc?: string;
	pattern?: string;
	options?: string[];
};

export type Attribute = {
	name: string;
	default: unknown;
	doc?: string;
	type: string;
	required: boolean;
};

/** This type represents a complex type in a XML schema definition. */
export type ComplexType = {
	/** Name of the complex type. */
	name: string;
	/** Documentation of the complex type. */
	doc?: string;
	/** Attributes of the complex type. */
	attrs: Attribute[];
	children?: string[];
};
type XMLTypeTree = { [key: string]: XMLTypeTree | 'recursive' };
type TypeName = string;
/**
 * Type of an XML schema definition.
 *
 * It defines the types allowed in an xml file, usually derived from an xsd file.
 */
export class XmlSchema {
	/** Simple types of the xml schema. */
	simpleTypes: SimpleType[] = [];
	/** Complex types of the xml schema. */
	complexTypes: ComplexType[] = [];

	get typeMap(): Map<TypeName, ComplexType> {
		const res = new Map<string, ComplexType>();
		for (const type of this.complexTypes) {
			res.set(type.name, type);
		}
		return res;
	}

	get parentsMap(): Map<TypeName, TypeName[]> {
		const res = new Map<string, string[]>();
		for (const { name } of this.complexTypes) {
			res.set(name, []);
		}
		for (const { name: parentName, children } of this.complexTypes) {
			if (!children) continue;
			for (const c of children) {
				res.get(c)!.push(parentName);
			}
		}
		return res;
	}

	get roots() {
		const res = [];
		for (const [name, children] of this.parentsMap.entries()) {
			if (children.length === 0) res.push(name);
		}
		return res;
	}

	get tree(): XMLTypeTree {
		const res: XMLTypeTree = {};
		const rec = (current: XMLTypeTree, types: TypeName[], already_visited: TypeName[]) => {
			// const isOneTypeAlreadyVisited = types.some((t) => already_visited.includes(t));
			for (const type of types) {
				if (already_visited.includes(type)) {
					current[type] = 'recursive';
					continue;
				}
				current[type] = {};
				const children = this.typeMap.get(type)?.children;
				if (!children) continue;
				rec(current[type], children, [...already_visited, type]);
			}
		};

		rec(res, this.roots, []);
		return res;
	}

	/** The different paths leading to a type. */
	get typePaths(): Map<TypeName, TypeName[][] | 'infinite'> {
		const res = new Map<TypeName, TypeName[][] | 'infinite'>();

		const rec = (tree: XMLTypeTree, path: TypeName[]) => {
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
 * Extracts xml schema from xsd string.
 * @param xsd - xsd string
 * @returns XMLSchema
 */
export async function parseXsd(xsd: string): Promise<XmlSchema | undefined> {
	if (!isBrowser()) return;
	await init();
	const schema = parse_xsd(xsd);

	if (!schema) return;

	const res: XmlSchema = new XmlSchema();

	for (const { name, doc, options, pattern } of schema.simple_types) {
		res.simpleTypes.push({
			name,
			doc,
			pattern,
			options
		});
	}

	for (const { name, children, fields, doc } of schema.complex_types) {
		res.complexTypes.push({
			name,
			attrs: fields.map(({ name, doc, type_name: type, required, default: default_ }) => {
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
			}),
			doc,
			children
		});
	}
	schema.free();
	return res;
}

export async function parseXsdFromUrl(url: string): Promise<XmlSchema | undefined> {
	if (!isBrowser()) return;
	const res = await fetch(url);
	const xsd = await res.text();
	return parseXsd(xsd);
}
