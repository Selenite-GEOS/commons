import { isEmpty, isEqual } from 'lodash-es';
import type { HTMLInputAttributes } from 'svelte/elements';
import { isIterable } from './iterable';
import type { StringArrayKeys, StringKeys } from '$lib/type';

export interface Filter<T, K extends keyof T = keyof T> {
	key: K;
	value: unknown;
	active?: boolean;
}

export type FilterDefinition<T> = {
	key: keyof T;
	type?: HTMLInputAttributes['type'];
};

export function getActiveFilters<T>(filters?: Iterable<Filter<T>>): Map<keyof T, Set<unknown>> {
	const activeFilters = new Map<keyof T, Set<unknown>>();
	for (const f of filters ?? []) {
		if (!f) continue;
		const { active = true, key, value } = f;
		if (!active) continue;
		if (!activeFilters.has(key)) activeFilters.set(key, new Set([]));
		activeFilters.get(key)!.add(value);
	}
	return activeFilters;
}

export function filterItems<T>({
	items = [],
	filters = []
}: { items?: Iterable<T>; filters?: Iterable<Filter<T>> } = {}) {
	const res: T[] = [];

	const activeFilters = getActiveFilters(filters);
	if (activeFilters.size === 0) return Array.from(items);
	for (const item of items) {
		for (const [key, set] of activeFilters) {
			const v = item[key];
			if (
				Array.from(set).some((filterV) => {
					if (isIterable(v)) {
						return Array.from(v).some((iterV) => isEqual(iterV, filterV));
					}

					return isEqual(v, filterV);
				})
			) {
				res.push(item);
				break;
			}
		}
	}
	return res;
}

export function getQueriedItems<T>({
	items = [],
	query,
	queriedKeys = []
}: {
	items?: Iterable<T>;
	query?: string;
	queriedKeys?: Iterable<StringKeys<T> | StringArrayKeys<T>>;
}): T[] {
	if (!query) return Array.from(items);
	if (isEmpty(queriedKeys)) return [];

	query = query.toLowerCase();

	const res: T[] = [];

	for (const item of items) {
		for (const key of queriedKeys) {
			const v = item[key];
			if (!v) continue;
			if (!Array.isArray(v)) {
				if (typeof v !== 'string' || !(v as string).toLowerCase().includes(query)) {
					continue;
				}
			} else {
				if (!v.some((s) => (s as string).toLowerCase().includes(query))) {
					continue;
				}
			}
			res.push(item);
			break;
		}
	}

	return res;
}
