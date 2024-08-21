import type { Position } from './math';
/**
 * Reactive window state for use in svelte 5.
 *
 * At the moment, it exposes with and height.
 */
export class WindowState {
	width = $state<number>(NaN);
	height = $state<number>(NaN);

	static #instance: WindowState | undefined = undefined;
	private static get instance() {
		if (!this.#instance) this.#instance = new WindowState();
		return this.#instance;
	}

	static get width() {
		return this.instance.width;
	}

	static get height() {
		return this.instance.height;
	}

	private constructor() {
		if (typeof window === 'undefined') return;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		window.addEventListener('resize', (e) => {
			this.width = window.innerWidth;
			this.height = window.innerHeight;
		});
	}
}

/**
 * Returns whether the current environment is a browser, based on window being defined.
 */
export function isBrowser() {
	return typeof window !== 'undefined';
}

/**
 * Constant indicating whether the current environment is a browser.
 */
export const browser = isBrowser();

export function posFromClient({
	clientX: x,
	clientY: y
}: {
	clientX: number;
	clientY: number;
}): Position {
	return { x, y };
}

/**
 * Definition of a rectangle..
 */
export class Rect {
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	get right() {
		return this.x + this.width;
	}

	get bottom() {
		return this.y + this.height;
	}
}

/**
 * Utils to compute intersection, union and area of bouding rectangles.
 */
export namespace Rect {
	/**
	 * Returns the intersection of multiple bouding rectangles.
	 */
	export function intersection(rect: Rect, ...rects: Rect[]): Rect {
		const res: Rect = new Rect();
		Object.assign(res, rect);

		for (const r of rects) {
			const a: Position = { x: Math.max(res.x, r.x), y: Math.max(res.y, r.y) };
			const b: Position = { x: Math.min(res.right, r.right), y: Math.min(res.bottom, r.bottom) };

			res.x = a.x;
			res.y = a.y;
			res.width = Math.max(b.x - a.x, 0);
			res.height = Math.max(b.y - a.y, 0);
		}
		return res;
	}

	/**
	 * Return the union of multiple bounding rectangles.
	 */
	export function union(rect: Rect, ...rects: Rect[]): Rect {
		const res: Rect = new Rect();
		Object.assign(res, rect);

		for (const r of rects) {
			const a: Position = { x: Math.min(res.x, r.x), y: Math.min(res.y, r.y) };
			const b: Position = { x: Math.max(res.right, r.right), y: Math.max(res.bottom, r.bottom) };

			res.x = a.x;
			res.y = a.y;
			res.width = b.x - a.x;
			res.height = b.y - a.y;
		}
		return res;
	}

	/**
	 * Returns the area of a rectangle.
	 */
	export function area(rect: Rect): number {
		return rect.width * rect.height;
	}
}

export function download(filename: string, data: unknown) {
	const text = typeof data === 'string' ? data : JSON.stringify(data, undefined, 4);
	const blob = new Blob([text], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	URL.revokeObjectURL(url);
	document.body.removeChild(a);
}

export function downloadJSON(name: string, data: unknown) {
	const json = JSON.stringify(data, undefined, 4);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${name}on`;
	document.body.appendChild(a);
	a.click();
	URL.revokeObjectURL(url);
	document.body.removeChild(a);
}

/**
 * Bounds of an element relative to the window.
 *
 * All distances are measured from the edges of the window.
 */
export type WindowBounds = {
	top: number;
	left: number;
	right: number;
	bottom: number;
};

/**
 * Returns the bounds of an element relative to the window.
 * @param element
 * @returns
 */
export function getBounds(element?: Element): WindowBounds {
	if (!element) return { top: 0, left: 0, right: 0, bottom: 0 };
	const { x, y, width, height } = element.getBoundingClientRect();
	return {
		left: x,
		top: y,
		right: WindowState.width - x - width,
		bottom: WindowState.height - y - height
	};
}

/**
 * Returns the union of the window bounds of multiple elements.
 * @param bounds
 * @returns
 */
export function getBoundsUnion(bounds: (WindowBounds | Element | undefined)[]): WindowBounds {
	const res: WindowBounds = { top: Infinity, left: Infinity, right: Infinity, bottom: Infinity };

	for (const target of bounds) {
		if (target === undefined) continue;
		const bound = target instanceof Element ? getBounds(target) : target;
		res.top = Math.min(res.top, bound.top);
		res.left = Math.min(res.left, bound.left);
		res.right = Math.min(res.right, bound.right);
		res.bottom = Math.min(res.bottom, bound.bottom);
	}
	return res;
}

/**
 * Returns padded window bounds.
 * @param bounds - bounds to pad
 * @param padding - pixels to pad
 * @returns padded window bounds
 */
export function padBounds(bounds: WindowBounds, padding: number): WindowBounds {
	return {
		top: bounds.top - padding,
		left: bounds.left - padding,
		right: bounds.right - padding,
		bottom: bounds.bottom - padding
	};
}

export function getBoundsIntersection(
	...bounds: (WindowBounds | HTMLElement | undefined)[]
): WindowBounds {
	const res: WindowBounds = { top: 0, left: 0, right: 0, bottom: 0 };

	for (const target of bounds) {
		if (target === undefined) continue;
		const bound = target instanceof HTMLElement ? getBounds(target) : target;
		res.top = Math.max(res.top, bound.top);
		res.left = Math.max(res.left, bound.left);
		res.right = Math.max(res.right, bound.right);
		res.bottom = Math.max(res.bottom, bound.bottom);
	}
	return res;
}

export function getClosestElement(target: Element, elements: Element[]) {
	let closestElement: Element | undefined = undefined;
	let closestDistance = Infinity;
	const tRect = target.getBoundingClientRect();
	for (const e of elements) {
		const eRect = e.getBoundingClientRect();
		const distance = Math.sqrt(Math.pow(eRect.x - tRect.x, 2) + Math.pow(eRect.y - tRect.y, 2));
		if (distance < closestDistance) {
			closestDistance = distance;
			closestElement = e;
		}
	}
	return closestElement;
}

export function getClosestElementIndex(target: Element, elements: Element[]) {
	let closestDistance = Infinity;
	let closestIndex = -1;
	const tRect = target.getBoundingClientRect();
	for (const [i, e] of elements.entries()) {
		const eRect = e.getBoundingClientRect();
		const distance = Math.sqrt(Math.pow(eRect.x - tRect.x, 2) + Math.pow(eRect.y - tRect.y, 2));
		if (distance < closestDistance) {
			closestDistance = distance;
			closestIndex = i;
		}
	}
	return closestIndex;
}
