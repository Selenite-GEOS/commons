import type { Position } from './math';

export class WindowState {
	width = $state<number>(NaN)
	height = $state<number>(NaN)

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
		if (typeof window === "undefined") return;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		window.addEventListener("resize", (e) => {
			this.width = window.innerWidth;
			this.height = window.innerHeight;
		})
	}	
}



export function isBrowser() {
	return typeof window !== 'undefined';
}

export function posFromClient({
	clientX: x,
	clientY: y
}: {
	clientX: number;
	clientY: number;
}): Position {
	return { x, y };
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
	a.download = `${name}.json`;
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
	bottom: number
};

/**
 * Returns the bounds of an element relative to the window.
 * @param element 
 * @returns 
 */
export function getBounds(element?: Element): WindowBounds {
	if (!element) return { top: 0, left: 0, right: 0, bottom: 0 };
	const { x, y, width, height } = element.getBoundingClientRect();
	return { left: x, top: y, right: WindowState.width - x - width, bottom: WindowState.height - y - height };
}

/**
 * Returns the union of the window bounds of multiple elements.
 * @param bounds 
 * @returns 
 */
export function getBoundsUnion(bounds: (WindowBounds | Element | undefined)[]): WindowBounds {
	const res: WindowBounds = {top: Infinity, left: Infinity, right: Infinity, bottom: Infinity};

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

export function getBoundsIntersection(...bounds: (WindowBounds | HTMLElement | undefined)[]): WindowBounds {
	const res: WindowBounds = {top: 0, left: 0, right: 0, bottom: 0};

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
		const distance = Math.sqrt(
			Math.pow(eRect.x - tRect.x, 2) + Math.pow(eRect.y - tRect.y, 2)
		);
		if (distance < closestDistance) {
			closestDistance = distance;
			closestElement = e;
		}
	}
	return closestElement
}

export function getClosestElementIndex(target: Element, elements: Element[]) {
	let closestDistance = Infinity;
	let closestIndex = -1;
	const tRect = target.getBoundingClientRect();
	for (const [i, e] of elements.entries()) {
		const eRect = e.getBoundingClientRect();
		const distance = Math.sqrt(
			Math.pow(eRect.x - tRect.x, 2) + Math.pow(eRect.y - tRect.y, 2)
		);
		if (distance < closestDistance) {
			closestDistance = distance;
			closestIndex = i;
		}
	}
	return closestIndex
}