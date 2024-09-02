// export * from './uuid';
// export * from './context';
// export { formatXml } from './xml';
// export * as SEGY from './segy';
// export * from './segy';
export * as String from './string';
export * from './string';
export * as EventModifier from './eventModifier';
export * from './eventModifier';
export * as Array from './array';
export * from './array';
export * as Math from './math';
export * from './math';
export * as HTML from './html.svelte';
export * from './html.svelte';
export * as XSD from './xsd';
export * from './xsd';
export * as XML from './xml';
export * from './xml';
export * as Storage from './storage';
export * from './storage';
export * as Promise from './promise';
export * from './promise';
export * as Layout from './layout';
export * from './layout';
export { v4 as uuidv4 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';
let idCount = 0;
export function newLocalId(baseName?: string) {
	idCount += 1;
	return `${baseName ?? 'local-unique-id'}-${idCount}`;
}

/**
 * @deprecated Use `uuid` instead.
 */
export function newUuid(baseName?: string) {
	if (baseName) {
		return `${baseName}-${uuidv4()}`;
	} else {
		return uuidv4();
	}
}

/**
 * Generates a new v4 UUID, with an optional prefix.
 * @param baseName prefix to add to the UUID
 */
export function uuid(baseName?: string) {
	if (baseName) {
		return `${baseName}-${uuidv4()}`;
	} else {
		return uuidv4();
	}
}