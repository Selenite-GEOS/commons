import { describe, expect, assert, it } from 'vitest';
import { Rect } from './html.svelte';

describe('Rect', () => {
	describe('intersection', () => {
		it('should return the intersection of two rects', () => {
            const rect1 = new Rect(0, 0, 10, 10);
            const rect2 = new Rect(5, 5, 10, 10);
            const res = Rect.intersection(rect1, rect2);
            expect(res).toEqual(new Rect(5, 5, 5, 5));
        });
        it('should return the intersection of three rects', () => {
            const rect1 = new Rect(0, 0, 10, 10);
            const rect2 = new Rect(5, 5, 10, 10);
            const rect3 = new Rect(7, 3, 10, 10);
            const res = Rect.intersection(rect1, rect2, rect3);
            expect(res).toEqual(new Rect(7, 5, 3, 5));
        })
	});

    describe('union', () => {
        it('should return the union of two rects', () => {
            const rect1 = new Rect(0, 0, 10, 10);
            const rect2 = new Rect(5, 5, 10, 10);
            const res = Rect.union(rect1, rect2);
            expect(res).toEqual(new Rect(0, 0, 15, 15));
        });
        it('should return the union of three rects', () => {
            const rect1 = new Rect(0, 0, 10, 10);
            const rect2 = new Rect(5, 5, 10, 10);
            const rect3 = new Rect(7, 3, 10, 10);
            const res = Rect.union(rect1, rect2, rect3);
            expect(res).toEqual(new Rect(0, 0, 17, 15));
        })
    });
});
