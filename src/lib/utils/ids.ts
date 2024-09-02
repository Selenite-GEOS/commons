export { v4 as uuidv4, v3 as uuidv3, v5 as uuidv5 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';

let idCount = 0;

/**
 * @deprecated Use `localId` instead.
 */
export function newLocalId(baseName?: string) {
	idCount += 1;
	return `${baseName ?? 'local-unique-id'}-${idCount}`;
}

/**
 * Generates a new local ID, with an optional prefix.
 *
 * Don't use it for persisted IDs.
 * @param baseName prefix to add to the ID
 */
export function localId(baseName?: string) {
	return `${baseName ?? 'local-unique-id'}-${idCount++}`;
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
