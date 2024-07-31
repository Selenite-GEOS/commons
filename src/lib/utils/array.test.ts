import { sortedByIndex } from './array.js';
import { describe, expect, test } from 'vitest';

describe('Array sorting', () => {
	test('sortedByIndex', () => {
		const a = [{ index: 3 }, { index: 1 }, { index: 2 }];
		const result = sortedByIndex(a);
		expect(result).toEqual([{ index: 1 }, { index: 2 }, { index: 3 }]);
	});
});
