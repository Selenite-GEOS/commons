/**
 * Actions that behave like an on click event listener but with additional conditions.
 * 
 * @see {@link clickIfNoDrag}
 * @module
 */

import { distance, posFromClient, type Position } from "$lib/utils";
import type { ActionReturn } from "svelte/action";

/**
 * Options for the clickIfNoDrag and clickIfDrag action.
 * @see {@link clickIfNoDrag}
 * @see {@link clickIfDrag}
 */
export type ClickDragOptions = {
	onclick?: (e: Event) => void;
	threshold?: number;
};

/**
 * Action that triggers a callback if the pointer is not moved after a pointerdown event.
 */
export function clickIfNoDrag<E extends HTMLElement>(
	node: E,
	options: ClickDragOptions
): ActionReturn<ClickDragOptions> {
	let pointerdownPos: Position | undefined;

	function onpointerup(e: PointerEvent) {
		node.removeEventListener('pointerup', onpointerup);
		node.removeEventListener('pointermove', onpointermove);
		options.onclick?.(e);
	}

	function onpointermove(e: PointerEvent) {
		const pos = posFromClient(e);
		if (distance(pointerdownPos!, pos) > (options.threshold ?? 2)) {
			node.removeEventListener('pointerup', onpointerup);
			node.removeEventListener('pointermove', onpointermove);
		}
	}

	function onpointerdown(e: PointerEvent) {
		pointerdownPos = posFromClient(e);
		node.addEventListener('pointerup', onpointerup);
		node.addEventListener('pointermove', onpointermove);
	}

	node.addEventListener('pointerdown', onpointerdown);

	return {
		destroy() {
			node.removeEventListener('pointerdown', onpointerdown);
			node.removeEventListener('pointerup', onpointerup);
			node.removeEventListener('pointermove', onpointermove);
		},

		update(newOptions) {
			options = newOptions;
		}
	};
}

/** 
 * Action that triggers a callback if the pointer is moved after a pointerdown event.
 */
export function clickIfDrag<E extends HTMLElement>(
	node: E,
	options: ClickDragOptions
): ActionReturn<ClickDragOptions> {
	let pointerdownPos: Position | undefined;
    let drag = false;

	function onpointerup(e: PointerEvent) {
		node.removeEventListener('pointerup', onpointerup);
		node.removeEventListener('pointermove', onpointermove);
		if (drag)
			options.onclick?.(e);
		drag = false;
	}

	function onpointermove(e: PointerEvent) {
		const pos = posFromClient(e);
		if (distance(pointerdownPos!, pos) > (options.threshold ?? 2)) {
			node.removeEventListener('pointermove', onpointermove);
			drag = true;
		}
	}

	function onpointerdown(e: PointerEvent) {
        drag = false;
		pointerdownPos = posFromClient(e);
		node.addEventListener('pointerup', onpointerup);
		node.addEventListener('pointermove', onpointermove);
	}

	node.addEventListener('pointerdown', onpointerdown);

	return {
		destroy() {
			node.removeEventListener('pointerdown', onpointerdown);
			node.removeEventListener('pointerup', onpointerup);
			node.removeEventListener('pointermove', onpointermove);
		},

		update(newOptions) {
			options = newOptions;
		}
	};
}
