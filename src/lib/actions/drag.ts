import { getBoundsUnion, getClosestElementIndex, type Position } from "$lib/utils";
import { draggable, type DragOptions } from "@neodrag/svelte";
import type { Action } from "svelte/action";

/** 
 * Options of a draggable item action.
 * 
 * Extends neodrag options.
 * @see [Neodrag documentation](https://www.neodrag.dev/docs/svelte#options)
 */
export type DragItemOptions = Omit<DragOptions, 'bounds' | 'transform' | 'recomputeBounds'> & {
	/** Array of draggable items. */
	items: unknown[];
	/** Duration of flip animation. */
	flipDuration: number;
};

/**
 * Action to make an item in an array of items draggable.
 * 
 * Options : {@link DragItemOptions}.
 */
export const draggableItem: Action<
	HTMLElement,
	DragItemOptions
> = (node, params) => {
	let target: HTMLElement | undefined;
	const rect = node.getBoundingClientRect();
	let base: Position = { x: rect.x, y: rect.y };
	let baseOffset: Position = { x: 0, y: 0 };
	let waitForFlip = false;
	function getBounds() {
		const neodrags = Array.from(node.parentElement!.querySelectorAll('.neodrag'));
		return getBoundsUnion(neodrags);
	}
	const dragOptions: DragOptions = {
		...params,
		bounds: {
			get top() {
				return getBounds().top;
			},
			get left() {
				return getBounds().left;
			},
			get right() {
				return getBounds().right;
			},
			get bottom() {
				return getBounds().bottom;
			}
		},
		recomputeBounds: {
			dragStart: true,
			drag: true,
			dragEnd: true
		},
		transform({ offsetX, offsetY, rootNode }) {
			if (!target) return;
			target.style.visibility = 'visible';
			target.style.left = `${base.x + offsetX - baseOffset.x}px`;
			target.style.top = `${base.y + offsetY - baseOffset.y}px`;
		},

		onDragStart(data) {
			const rect = node.getBoundingClientRect();
			base = { x: rect.x, y: rect.y };
			target = node.cloneNode(true) as HTMLElement;
			target.classList.remove('neodrag');
			node.parentElement?.appendChild(target);
			target.style.position = 'fixed';
			target.style.pointerEvents = 'none';
			target.style.left = `${base.x}px`;
			target.style.top = `${base.y}px`;
			target.style.visibility = 'hidden';
			document.body.style.pointerEvents = 'none';
			target.style.pointerEvents = 'auto';

			target.style.visibility = 'visible';
			node.style.opacity = '0';
			params.onDragStart?.(data);
		},

		onDrag(data) {
			params.onDrag?.(data);
			if (waitForFlip) return;
			if (!target) return;
			document.documentElement.style.cursor = 'grabbing';

			target.style.cursor = 'grabbing';
			if (!node.parentElement) {
				console.error("Couldn't find parent element");
				return;
			}
			const neodrags = Array.from(node.parentElement.querySelectorAll('.neodrag'));
			const closestIndex = getClosestElementIndex(target, neodrags);
			if (closestIndex == -1) return;

			const currentIndex = neodrags.indexOf(node);

			if (currentIndex === closestIndex) return;
			console.debug('Move from', currentIndex, 'to', closestIndex);
			params.items.splice(closestIndex, 0, params.items.splice(currentIndex, 1)[0]);
			waitForFlip = true;
			setTimeout(() => {
				waitForFlip = false;
			}, params.flipDuration);
		},

		onDragEnd(data) {
			document.body.style.pointerEvents = 'auto';
			baseOffset = { x: data.offsetX, y: data.offsetY };
			document.body.style.cursor = '';
			document.documentElement.style.cursor = '';
			target?.remove();
			node.style.opacity = '1';
			params.onDragEnd?.(data);
		}
	};
	const draggableReturn = draggable(node, dragOptions);

	return {
		destroy() {
			target?.remove();
			if (draggableReturn) draggableReturn.destroy?.();
		}
	};
};
