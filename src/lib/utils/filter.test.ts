import { filterItems, getQueriedItems } from './filter';
import { describe, it, expect } from 'vitest';
import { cloneDeep } from 'lodash-es';

function getItems() {
	return [{ i: 0 }, { i: 1 }, { i: 2 }];
}
function getTagsItems(): { tags: string[]; i: number }[] {
	return [
		{ tags: ['0', 'even'], i: 0 },
		{ tags: ['1', 'odd'], i: 1 },
		{ tags: ['2', 'even'], i: 2 }
	];
}

describe('filter', () => {
	it('should return empty for no items', () => {
		expect(filterItems()).toEqual([]);
		expect(filterItems({ items: [] })).toEqual([]);
		expect(filterItems({ items: [], filters: [] })).toEqual([]);
		expect(filterItems({ filters: [] })).toEqual([]);
		expect(filterItems({ items: new Set() })).toEqual([]);
	});
	it('should keep all items with no filters', () => {
		const items: { i: number }[] = [{ i: 0 }, { i: 1 }, { i: 2 }];
		const res = cloneDeep(items);
		expect(filterItems({ items })).toEqual(res);
	});
	it('should keep all items when all filters are inactive', () => {
		const items = getItems();
		const res = cloneDeep(items);
		expect(filterItems({ items, filters: [{ active: false, key: 'i', value: 0 }] })).toEqual(res);
	});
	it('should keep all items in a set with no filters', () => {
		const items = [{ i: 0 }, { i: 1 }, { i: 2 }];
		const set = new Set(items);
		const res = cloneDeep(items);

		expect(filterItems({ items: set })).toEqual(res);
	});
	it('should filter items based on a simple key', () => {
		const items = getItems();
		expect(filterItems({ items, filters: [{ active: true, key: 'i', value: 0 }] })).toEqual([
			{ i: 0 }
		]);
		expect(
			filterItems({
				items,
				filters: [
					{ active: true, key: 'i', value: 0 },
					{ active: true, key: 'i', value: 2 }
				]
			})
		).toEqual([{ i: 0 }, { i: 2 }]);
	});
	it('should filter items based on array key', () => {
		const items = getTagsItems();
		expect(filterItems({ items, filters: [{ key: 'tags', value: '0', active: true }] })).toEqual([
			items[0]
		]);
		expect(filterItems({ items, filters: [{ key: 'tags', value: 'even' }] })).toEqual([
			items[0],
			items[2]
		]);
		expect(filterItems({ items, filters: [{ key: 'tags', value: 'odd' }] })).toEqual([items[1]]);
	});
});

function queriableItems(): { label?: string; path?: string[]; tags?: string[] }[] {
	return [
		{ label: 'A', path: ['1'] },
		{ label: 'a', path: ['1'] },
		{ label: 'B' },
		{ label: '__a__b__' },
		{ label: '__A_b__' },
		{ label: 'Z', path: ['a'] }
	];
}

describe('queriedItems', () => {
	it('should query all items when query is empty', () => {
		const items = queriableItems();
		expect(getQueriedItems({ items, query: '' })).toEqual(items);
		expect(getQueriedItems({ items })).toEqual(items);
	});
	it('should query no items when query is present but no queried keys', () => {
		const items = queriableItems();
		expect(getQueriedItems({ items, query: 'query' })).toEqual([]);
		expect(getQueriedItems({ items, query: 'a' })).toEqual([]);
	});
	it('should query the right items when query is present and one queried key in a case insentive fashion', () => {
		const items = queriableItems();
		expect(getQueriedItems({ items, query: 'a', queriedKeys: ['label'] })).toEqual([
			items[0],
			items[1],
			items[3],
			items[4]
		]);
	});
	it('should query the right items when query is present and one queried key in a case insentive fashion', () => {
		const items = queriableItems();
		expect(getQueriedItems({ items, query: 'b', queriedKeys: ['label'] })).toEqual([
			items[2],
			items[3],
			items[4]
		]);
	});
	it('should query no items when query is present but the queried key is empty string array', () => {
		expect(getQueriedItems({ items: queriableItems(), query: ' ', queriedKeys: ['path'] })).toEqual(
			[]
		);
	});
	it('should query no items when query is present but the queried key is empty string array', () => {
		expect(getQueriedItems({ items: queriableItems(), query: '1', queriedKeys: ['path'] })).toEqual(
			[
				{ label: 'A', path: ['1'] },
				{ label: 'a', path: ['1'] }
			]
		);
	});
});
