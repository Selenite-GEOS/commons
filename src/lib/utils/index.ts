// export * from './uuid';
// export * from './context';
// export { formatXml } from './xml.js';
export * from './string.js';
export * from './eventListeners.js';
export * from './array/index.js'
export * from './math.js'
export * from './type.js'
export { v4 as uuidv4 } from 'uuid';
import {v4 as uuid} from 'uuid'
let idCount = 0;
export function newLocalId(baseName?: string) {
	idCount += 1;
	return `${baseName ?? 'local-unique-id'}-${idCount}}`;
}

export function newUuid(baseName?: string) {
	return `${baseName ? baseName + '-' : ''}${uuid()}`;
}
