// export * from './uuid';
// export * from './context';
// export { formatXml } from './xml.js';
export * as String from './string';
export * from './string.js';
export * as EventModifier from './eventModifier.js';
export * from './eventModifier.js';
export * as Array from './array';
export * from './array';
export * as Math from './math.js';
export * from './math.js';
export * as HTML from './html.svelte.js';
export * from './html.svelte.js';
export * as XSD from './xsd.js';
export * from './xsd.js';
export * as XML from './xml';
export * from './xml';
export * as Storage from './storage.js';
export * from './storage.js';
export * as Promise from './promise.js';
export * from './promise.js';
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
