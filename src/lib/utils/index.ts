// export * from './uuid';
// export * from './context';
// export { formatXml } from './xml';
export * as SEGY from './segy';
export * from './segy';
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
import { v4 as uuid } from 'uuid';
let idCount = 0;
export function newLocalId(baseName?: string) {
	idCount += 1;
	return `${baseName ?? 'local-unique-id'}-${idCount}`;
}

export function newUuid(baseName?: string) {
	return `${baseName ? baseName + '-' : ''}${uuid()}`;
}
