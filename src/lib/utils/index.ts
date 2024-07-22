// export * from './uuid';
// export * from './context';
// export { formatXml } from './xml.js';
export * as String from './string'
export * from './string.js';
export * as EventListener from './eventListeners.js'
export * from './eventListeners.js';
export * as Array from './array/index.js'
export * from './array/index.js'
export * as Math from './math.js'
export * from './math.js'
export * as HTML from './html.js'
export * from './html.js'
export * as XSD from './xsd.js'
export * from './xsd.js'
export * as Storage from './storage.js'
export * from './storage.js'
export { v4 as uuidv4 } from 'uuid';
import {v4 as uuid} from 'uuid'
let idCount = 0;
export function newLocalId(baseName?: string) {
	idCount += 1;
	return `${baseName ?? 'local-unique-id'}-${idCount}`;
}

export function newUuid(baseName?: string) {
	return `${baseName ? baseName + '-' : ''}${uuid()}`;
}
