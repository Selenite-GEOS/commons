import { posFromClient, Rect, stopPropagation, type Position } from '$lib/utils';
import type { Action } from 'svelte/action';

/**
 * Parameters of the box selection Svelte action.
 */
export type BoxSelectionParams = {
	/** Is the box selection active. */
	enabled?: boolean;
	/** Selection callback. */
	onselection?: (nodes: Element[]) => void;

	/** Element containing the elements to select. */
	holder?: HTMLElement;

	/** Treshold for elements to be considered inside the box selection. Defaults to 0.9. */
	threshold?: number;
};

/**
 * Action to enable box selection on an element.
 * @param node Element to attach the action to
 * @param params Parameters for the action
 * @returns Svelte action
 */
export const boxSelection: Action<HTMLElement, BoxSelectionParams | undefined> = (
	node,
	params: BoxSelectionParams = {}
) => {
	function pOver(e: PointerEvent) {
		node.style.cursor = 'crosshair';
	}

	function pLeave(e: PointerEvent) {
		node.style.cursor = '';
	}

	function pMove(e: PointerEvent) {
		if (!box) return;
		setBoxPos(startPos!, posFromClient(e));
	}

	let box: HTMLElement | undefined;
	let startPos: Position | undefined;
	function pDown(e: PointerEvent) {
		stopPropagation(e)
		document.body.style.userSelect = 'none';
		if (box) {
			destroyBox();
			document.removeEventListener('pointermove', pMove);
			return;
		}
		createBox(posFromClient(e));

		document.addEventListener('pointermove', pMove);
		document.addEventListener('pointerup', pUp, { once: true, capture: true });
	}
	function pUp(e: PointerEvent) {
		stopPropagation(e)
		document.body.style.userSelect = '';
		if (!box) return;
		const selected: Element[] = [];
		const selectionRect = box.getBoundingClientRect();
		for (const n of (params.holder ?? node).children) {
			const r = n.getBoundingClientRect();
			const intersection = Rect.intersection(selectionRect, r);
			const a = Rect.area(r);
			const ai = Rect.area(intersection);

			const k = ai / a;
			if (k > (params.threshold ?? 0.9)) {
				selected.push(n);
			}
		}
		console.debug('Box selection', selected);
		params.onselection?.(selected);
		destroyBox();
		box = undefined;
	}

	function setBoxPos(a: Position, b: Position) {
		if (!box) return;
		let x: number, y: number, w: number, h: number;
		if (a.x < b.x) {
			x = a.x;
			w = b.x - a.x;
		} else {
			x = b.x;
			w = a.x - b.x;
		}
		if (a.y < b.y) {
			y = a.y;
			h = b.y - a.y;
		} else {
			y = b.y;
			h = a.y - b.y;
		}
		const rect = node.getBoundingClientRect();
		if (x < rect.left) {
			w -= rect.left - x;
			x = rect.left;
		} else if (x + w > rect.right) {
			w = rect.right - x;
		}
		if (y < rect.top) {
			h -= rect.top - y;
			y = rect.top;
		} else if (y + h > rect.bottom) {
			h = rect.bottom - y;
		}
		box.style.left = x + 'px';
		box.style.top = y + 'px';
		box.style.width = w + 'px';
		box.style.height = h + 'px';
	}

	function createBox(pos: Position) {
		if (box) return;
		box = document.createElement('div');
		box.style.position = 'absolute';
		box.style.border = '1px solid';
		box.classList.add('border-accent-content');
		box.classList.add('border-opacity-50');
		box.classList.add('bg-accent');
		box.classList.add('bg-opacity-25');
		box.style.pointerEvents = 'none';
		document.body.appendChild(box);
		setBoxPos(pos, pos);
		startPos = pos;
	}

	function destroyBox() {
		if (box) {
			document.body.removeChild(box);
			box = undefined;
		}
	}

	function setup() {
		node.addEventListener('pointerover', pOver);
		node.addEventListener('pointerleave', pLeave);
		node.addEventListener('pointerdown', pDown, { capture: true });
	}
	function destroy() {
		node.style.cursor = '';
		node.removeEventListener('pointerover', pOver);
		node.removeEventListener('pointerleave', pLeave);
		node.removeEventListener('pointerdown', pDown, { capture: true });
		node.removeEventListener('pointermove', pMove);
		if (box) {
			document.body.removeChild(box);
			box = undefined;
		}
	}
	if (params.enabled ?? true) {
		setup();
	}
	return {
		update(newParams) {
			params = newParams ?? {};
			if (params.enabled ?? true) {
				setup();
			} else {
				destroy();
			}
		},
		destroy
	};
};
