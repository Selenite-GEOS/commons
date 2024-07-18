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

/**
 * Type of an XML schema definition.
 *
 * It defines the types allowed in an xml file, usually derived from an xsd file.
 */
export type XmlSchema = {
	/** Simple types of the xml schema. */
	simpleTypes: SimpleType[];
	/** Complex types of the xml schema. */
	complexTypes: ComplexType[];
};

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

	const res: XmlSchema = {
		simpleTypes: [],
		complexTypes: []
	};

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
					doc,
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
