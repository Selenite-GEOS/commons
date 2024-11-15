/**
 * Utilities for layouting elements.
 * @module
 */

import { Vector2D } from '$lib/datastructure';

/**
 * Structure used by the layout utilities.
 *
 * It represents a bounding rect for a layout element.
 */
export type LayoutRect = {
	/** Position on the x axis of top left corner. */
	x: number;
	/** Position on the y axis of top left corner. */
	y: number;
	/** Width of the bounding rect. */
	w: number;
	/** Height of the bounding rect. */
	h: number;
};

/**
 * Additional options for the layout utilities.
 */
export type LayoutOptions = {
	/** Index of the reference element. Defaults to 0. */
	refPos?: number;
};

/**
 * Returns the offsets computed by the function `f` for each rect in `rects`.
 * @param rects - Bounding rectangles of elements to layout.
 * @param f - Function that computes the offset for each element.
 * @param options - Additional options for the layout.
 * @returns Array of offsets for each element.
 */
function getOffsets(
	rects: LayoutRect[],
	f: (ref: LayoutRect, o: LayoutRect) => Vector2D,
	options: LayoutOptions = {}
): Vector2D[] {
	if (rects.length === 0) return [];
	if (options.refPos && !(options.refPos in rects)) {
		throw new Error(`Invalid refPos: ${options.refPos}`);
	}

	const ref = rects[options.refPos ?? 0];
	const res = [];

	for (const o of rects) {
		res.push(f(ref, o));
	}
	return res;
}

/**
 * Returns offsets to align the tops of elements to the top of a reference element.
 * @param rects - Bounding rectangles of elements to align.
 * @param options - Additional options for the layout.
 * @returns Array of offsets for each element.
 */
export function getAlignTopOffsets(rects: LayoutRect[], options?: LayoutOptions): Vector2D[] {
	return getOffsets(rects, (r, o) => ({ x: 0, y: r.y - o.y }), options);
}

/**
 * Returns offsets to align the bottoms of elements to the bottom of a reference element.
 * @param rects - Bounding rectangles of elements to align.
 * @param options - Additional options for the layout.
 * @returns Array of offsets for each element.
 */
export function getAlignBottomOffsets(rects: LayoutRect[], options?: LayoutOptions): Vector2D[] {
	return getOffsets(rects, (r, o) => ({ x: 0, y: r.y + r.h - o.y - o.h }), options);
}

/**
 * Returns offsets to align the middles of elements to the middle of a reference element.
 * @param rects - Bounding rectangles of elements to align.
 * @param options - Additional options for the layout.
 * @returns Array of offsets for each element.
 */
export function getAlignMiddleOffsets(rects: LayoutRect[], options?: LayoutOptions): Vector2D[] {
	return getOffsets(rects, (r, o) => ({ x: 0, y: r.y + r.h / 2 - o.y - o.h / 2 }), options);
}

/**
 * Returns offsets to align the lefts of elements to the left of a reference element.
 * @param rects - Bounding rectangles of elements to align.
 * @param options - Additional options for the layout.
 * @returns Array of offsets for each element.
 */
export function getJustifyLeftOffsets(rects: LayoutRect[], options?: LayoutOptions): Vector2D[] {
	return getOffsets(rects, (r, o) => ({ x: r.x - o.x, y: 0 }), options);
}

/**
 * Returns offsets to align the rights of elements to the right of a reference element.
 * @param rects - Bounding rectangles of elements to align.
 * @param options - Additional options for the layout.
 * @returns Array of offsets for each element.
 */
export function getJustifyRightOffsets(rects: LayoutRect[], options?: LayoutOptions): Vector2D[] {
	return getOffsets(rects, (r, o) => ({ x: r.x + r.w - o.x - o.w, y: 0 }), options);
}

/**
 * Returns offsets to align the centers of elements to the center of a reference element.
 * @param rects - Bounding rectangles of elements to align.
 * @param options - Additional options for the layout.
 * @returns Array of offsets for each element.
 */
export function getJustifyCenterOffsets(rects: LayoutRect[], options?: LayoutOptions): Vector2D[] {
	return getOffsets(rects, (r, o) => ({ x: r.x + r.w / 2 - o.x - o.w / 2, y: 0 }), options);
}

/**
 * Additional options for the space between layout utilities.
 */
export type LayoutBetweenOptions = {
	/** Min gap between elements. */
	minGap?: number;
	/** Whether to use a center based approach, or a bounds based approach. Defaults to bounds. */
	centerBased?: boolean;
};

/**
 * Returns offsets to space elements evenly on the x axis with a minimum gap.
 * @param rects - Bounding rectangles of elements to align.
 * @param options - Additional options for the layout.
 * @returns Array of offsets for each element.
 */
export function getJustifyBetweenOffsets(
	rects: LayoutRect[],
	{ minGap = 10, centerBased = false }: LayoutBetweenOptions = {}
): Vector2D[] {
	if (rects.length === 0) return [];

	// Left based
	if (!centerBased) {
		const sortedRects = rects.map((r, i) => ({ i, r })).toSorted((a, b) => a.r.x - b.r.x);
		const min = sortedRects[0].r.x;
		const res: Vector2D[] = [];
		let offset = 0;
		let whitespace = 0;
		for (let i = 0; i < sortedRects.length - 1; i++) {
			const a = sortedRects[i].r;
			const b = sortedRects[i + 1].r;
			whitespace += Math.max(minGap, Math.abs(b.x - a.x - a.w));
		}
		const gap = whitespace / (sortedRects.length - 1);
		for (const [, { i, r }] of sortedRects.entries()) {
			res[i] = {
				x: min + offset - r.x,
				y: 0
			};
			offset += r.w + gap;
		}
		return res;
	} else {
		const centers: [number, number][] = [];
		let min = Infinity;
		let totalWidth = 0;
		for (const [i, r] of rects.entries()) {
			const c = r.x + r.w / 2;
			min = Math.min(min, c);
			totalWidth += r.w;
			centers.push([i, c]);
		}
		totalWidth += (rects.length - 1) * minGap;
		const max = min + totalWidth;
		const step = (max - min) / (rects.length - 1);

		const sortedCenters = centers.sort((a, b) => a[1] - b[1]);

		const res: Vector2D[] = [];
		for (const [k, [i, c]] of sortedCenters.entries()) {
			res[i] = {
				x: min + k * step - c,
				y: 0
			};
		}

		return res;
	}
}

/**
 * Returns offsets to space elements evenly on the y axis with a minimum gap.
 * @param rects - Bounding rectangles of elements to align.
 * @param options - Additional options for the layout.
 * @returns Array of offsets for each element.
 */
export function getAlignBetweenOffsets(
	rects: LayoutRect[],
	{ minGap = 10, centerBased = false }: LayoutBetweenOptions = {}
): Vector2D[] {
	if (rects.length === 0) return [];

	// Top based
	if (!centerBased) {
		const sortedRects = rects.map((r, i) => ({ i, r })).toSorted((a, b) => a.r.y - b.r.y);
		const min = sortedRects[0].r.y;
		const res: Vector2D[] = [];
		let offset = 0;
		let whitespace = 0;
		for (let i = 0; i < sortedRects.length - 1; i++) {
			const a = sortedRects[i].r;
			const b = sortedRects[i + 1].r;
			whitespace += Math.max(minGap, Math.abs(b.y - a.y - a.h));
		}
		const gap = whitespace / (sortedRects.length - 1);
		for (const [, { i, r }] of sortedRects.entries()) {
			res[i] = {
				x: 0,
				y: min + offset - r.y
			};
			offset += r.h + gap;
		}
		return res;
	} else {
		const centers: [number, number][] = [];
		let min = Infinity;
		let totalWidth = 0;
		for (const [i, r] of rects.entries()) {
			const c = r.y + r.h / 2;
			min = Math.min(min, c);
			totalWidth += r.w;
			centers.push([i, c]);
		}
		totalWidth += (rects.length - 1) * minGap;
		const max = min + totalWidth;
		const step = (max - min) / (rects.length - 1);

		const sortedCenters = centers.sort((a, b) => a[1] - b[1]);

		const res: Vector2D[] = [];
		for (const [k, [i, c]] of sortedCenters.entries()) {
			res[i] = {
				x: 0,
				y: min + k * step - c
			};
		}

		return res;
	}
}
