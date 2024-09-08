// export function isEmptyIterable(iterable: Iterable<unknown>) {
// 	for (const _ of iterable) {
// 		return false;
// 	}

// 	return true;
// }

export function isIterable(obj: unknown): obj is Iterable<unknown> {
	// checks for null and undefined
	if (obj == null) {
		return false;
	}
	return (
		typeof obj === 'object' && Symbol.iterator in obj && typeof obj[Symbol.iterator] === 'function'
	);
}
