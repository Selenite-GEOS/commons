import { describe, expect, it } from 'vitest';
import { Rect, WindowState, isBrowser } from './html.svelte';

describe('WindowState', () => {
	it('should return the window width', () => {
		window.innerWidth = 2;
		const windowState = new WindowState();
		expect(windowState.width).toBe(2);
	});
	it('should return the window height', () => {
		window.innerHeight = 2;
		const windowState = new WindowState();
		expect(windowState.width).toBe(2);
	});
});

describe('isBrowser', () => {
	it('should return true inside of browser (happy-dom)', () => {
		expect(isBrowser()).toBe(true);
	});
});

// describe('download', () => {
//     it("should download data", () => {
//         download("test", "test data")
//     })
// })

describe('Rect', () => {
	describe('intersection', () => {
		it('should return the intersection of two rects', () => {
			const R = typeof DOMRect === 'undefined' ? Rect : DOMRect;
			const rect1 = new R(0, 0, 10, 10);
			const rect2 = new R(5, 5, 10, 10);
			const res = Rect.intersection(rect1, rect2);
			expect(res).toEqual(new Rect(5, 5, 5, 5));
		});

		it('should return the intersection of two rects - 2', () => {
			const a = new Rect(275, 260, 303, 296);
			const b = new Rect(348, 312, 160, 160);
			const res = Rect.intersection(a, b);
			expect(res).toEqual(new Rect(348, 312, 160, 160));
		});
		it('should return the intersection of three rects', () => {
			const rect1 = new Rect(0, 0, 10, 10);
			const rect2 = new Rect(5, 5, 10, 10);
			const rect3 = new Rect(7, 3, 10, 10);
			const res = Rect.intersection(rect1, rect2, rect3);
			expect(res).toEqual(new Rect(7, 5, 3, 5));
		});
		it('should handle cases with no intersection', () => {
			const rect1 = new Rect(5, 5, 5, 5);
			const rect2 = new Rect(-5, -5, 1, 1);
			const res = Rect.intersection(rect1, rect2);
			expect(res).toEqual(new Rect(5, 5, 0, 0));
		});
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
		});
	});
});
