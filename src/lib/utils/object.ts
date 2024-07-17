export function getProperties<T extends object>(obj: T): (keyof T)[] {
	const res: (keyof T)[] = [];
	for (const k of Object.keys(obj)) {
		res.push(k as keyof T);
	}
	for (const [k, v] of Object.entries(
		Object.getOwnPropertyDescriptors(Object.getPrototypeOf(obj))
	)) {
		if (!v.get || !v.set) continue;
		res.push(k as keyof T);
	}
	return res;
}

export function applyParams<T extends object>(
	target: T,
	constructor: new () => T,
	params: Record<string, unknown>
) {
	if (Object.keys(params).length === 0) return;
	const ref = new constructor();
	Object.assign(target, Object.fromEntries(Object.entries(params).filter(([k]) => k in ref)));
}
