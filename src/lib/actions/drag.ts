import { getBoundsUnion, getClosestElementIndex, getDistance, type Position } from '$lib/utils';
import { draggable, type DragOptions } from '@neodrag/svelte';
import { tick } from 'svelte';
import type { Action } from 'svelte/action';

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
	/** 
	 * Min distance between items swaps. 
	 * 
	 * After doing an item swap, the next swap will be ignored if the distance
	 * between the last swap and the current position is less than this value.
	 */
	minSwapDistance?: number;
};

/**
 * Action to make an item in an array of items draggable.
 *
 * Options : {@link DragItemOptions}.
 */
export const draggableItem: Action<HTMLElement, DragItemOptions> = (node, params) => {
	/** Clone of node to drag. */
	let clone: HTMLElement | undefined;
	const rect = node.getBoundingClientRect();
	let base: Position = { x: rect.x, y: rect.y };
	let baseOffset: Position = { x: 0, y: 0 };
	/** Offset at last item swap. */
	let lastSwapOffset: Position |undefined;
	let waitForFlip = false;
	let currentParams = params;
	let numSwaps = 0;
	/**
	 * Returns the bounds of the draggable item.
	 * 
	 * It is computed by getting the union of the bounds of all draggable items.
	 */
	function getBounds() {
		console.debug("Compute bounds.")
		const neodrags = Array.from(node.parentElement!.querySelectorAll('.neodrag'));
		return getBoundsUnion(neodrags);
	}

	let bounds = getBounds();
	const dragOptions: DragOptions = {
		...params,
		bounds: {
			get top() {
				return bounds.top;
			},
			get left() {
				return bounds.left;
			},
			get right() {
				return bounds.right;
			},
			get bottom() {
				return bounds.bottom;
			}
		},
		recomputeBounds: {
			dragStart: true,
			drag: true,
			dragEnd: true
		},
		// Apply transform to clone
		transform({ offsetX, offsetY, rootNode }) {
			if (!clone) return;
			clone.style.left = `${base.x + offsetX - baseOffset.x}px`;
			clone.style.top = `${base.y + offsetY - baseOffset.y}px`;
		},

		async onDragStart(data) {
			params.onDragStart?.(data);
			await tick()
			bounds = getBounds();

			// Create clone of node.
			const rect = node.getBoundingClientRect();
			base = { x: rect.x, y: rect.y };
			clone = node.cloneNode(true) as HTMLElement;
			clone.classList.remove('neodrag');
			node.parentElement?.appendChild(clone);
			clone.style.position = 'fixed';
			clone.style.pointerEvents = 'none';
			clone.style.left = `${base.x}px`;
			clone.style.top = `${base.y}px`;
			clone.style.visibility = 'hidden';
		},

		onDrag(data) {
			params.onDrag?.(data);
			
			if (waitForFlip) return;
			if (!clone) return;
			clone.style.pointerEvents = 'auto';
			document.body.style.pointerEvents = 'none';
			clone.style.visibility = 'visible';
			node.style.opacity = '0';
			document.documentElement.style.cursor = 'grabbing';

			clone.style.cursor = 'grabbing';

			
			const offset: Position = {x: data.offsetX, y: data.offsetY}
			if (
				lastSwapOffset &&
				getDistance(lastSwapOffset, offset) < (params.minSwapDistance ?? (clone.clientWidth / 2))
			) {
				console.debug('Too close from last swap');
				return;
			}

			const neodrags = Array.from(node.parentElement!.querySelectorAll('.neodrag'));
			const closestIndex = getClosestElementIndex(clone, neodrags);
			if (closestIndex == -1) return;

			const currentIndex = neodrags.indexOf(node);

			if (currentIndex === closestIndex) return;
			console.debug(numSwaps++, 'Move from', currentIndex, 'to', closestIndex);
			params.items.splice(closestIndex, 0, params.items.splice(currentIndex, 1)[0]);
			lastSwapOffset = offset;
			waitForFlip = true;
			setTimeout(() => {
				waitForFlip = false;
			}, currentParams.flipDuration);
		},

		onDragEnd(data) {
			document.body.style.pointerEvents = 'auto';
			baseOffset = { x: data.offsetX, y: data.offsetY };
			document.body.style.cursor = '';
			document.documentElement.style.cursor = '';
			clone?.remove();
			node.style.opacity = '1';
			params.onDragEnd?.(data);
		}
	};
	const draggableReturn = draggable(node, dragOptions);

	return {
		destroy() {
			clone?.remove();
			if (draggableReturn) draggableReturn.destroy?.();
		},
		update(params) {
			currentParams = params;
			bounds = getBounds();
			if (draggableReturn) {
				draggableReturn.update?.(dragOptions);
			}
		}
	};
};
