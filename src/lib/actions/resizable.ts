import { Vector2D } from '$lib/datastructure';
import { PointerDownWatcher, posFromClient } from '$lib/utils';
import type { Action, ActionReturn } from 'svelte/action';

const resizeHandleMap = new Map<
	HTMLElement,
	{
		onpointerenter: (e: PointerEvent) => void;
		onpointerleave: (e: PointerEvent) => void;
		threshold: number;
	}
>();
const enteredNodes = new Set<HTMLElement>();
function globalOnpointermove(e: PointerEvent) {
	const pos = posFromClient(e);
	for (const [node, { onpointerenter, onpointerleave, threshold: m }] of resizeHandleMap) {
		const rect = node.getBoundingClientRect();
		if (
			pos.x >= rect.left - m &&
			pos.x <= rect.right + m &&
			pos.y >= rect.top - m &&
			pos.y <= rect.bottom + m
		) {
			if (enteredNodes.has(node)) return;
			enteredNodes.add(node);
			onpointerenter(e);
		} else {
			if (!enteredNodes.has(node)) return;
			enteredNodes.delete(node);
			onpointerleave(e);
		}
	}
}
const defaultThreshold = 5;
export type ResizeHandleParams<Element extends HTMLElement = HTMLElement> = {
	threshold?: number;
	onresize?: (params: {
		side: ResizeSide;
		node: Element;
		event: PointerEvent;
		height: number;
		width: number;
	}) => void;
	sides?:
		| { top?: boolean; left?: boolean; bottom?: boolean; right?: boolean; all?: boolean }
		| undefined;
};

export type ResizeSide = 'n' | 'w' | 's' | 'e' | 'ne' | 'se' | 'nw' | 'sw';

export function resizeHandle<N extends HTMLElement = HTMLElement>(
	node: N,
	params: ResizeHandleParams<N> = {}
): ActionReturn<ResizeHandleParams<N>> {
	function onpointerenter(e: PointerEvent) {
		document.addEventListener('pointermove', onpointermove);
		removePointermoveCleanup?.();
	}
	let removePointermoveCleanup: (() => void) | undefined;
	function onpointerleave(e: PointerEvent) {
		// Wait for pointer up to stop resizing
		removePointermoveCleanup = PointerDownWatcher.instance.subscribe((down) => {
			if (!down) {
				document.removeEventListener('pointermove', onpointermove);
				removePointermoveCleanup?.();
				document.body.style.cursor = '';
				currentSide = null;
			}
		});
	}

	let resetLastPosCleanup: (() => void) | undefined;

	let currentSide: ResizeSide | null = null;
	let lastPos: Vector2D | undefined;
	let baseWidth: number | undefined;
	let baseHeight: number | undefined;
	function onpointermove(e: PointerEvent) {
		const pointerdownWatcher = PointerDownWatcher.instance;
		const pointerdown = pointerdownWatcher.isPointerDown;
		if (pointerdown && currentSide !== null) {
			if (!resetLastPosCleanup) {
				resetLastPosCleanup = pointerdownWatcher.subscribe((down) => {
					if (!down) {
						lastPos = undefined;
						baseHeight = undefined;
						baseWidth = undefined;
						resetLastPosCleanup?.();
						resetLastPosCleanup = undefined;
					}
				});
			}
			const rect = node.getBoundingClientRect();
			if (!baseWidth) {
				baseWidth = rect.width;
			}
			if (!baseHeight) {
				baseHeight = rect.height;
			}
			const downPos = pointerdownWatcher.pos;
			if (!downPos) return;
			// Dragging
			if (!lastPos) {
				lastPos = downPos;
			}
			const pos = posFromClient(e);
			const offset = Vector2D.subtract(pos, lastPos);
			// const totalOffset = Vector2D.subtract(pos, downPos);
			lastPos = pos;
			document.body.style.userSelect = 'none';
			
			let width = rect.width;
			let height = rect.height;
			if (currentSide.includes('e')) {
				width = pos.x - rect.left;
			} else if (currentSide.includes('w')) {
				width = rect.right - pos.x;
			}
			if (currentSide.includes('s')) {
				height = pos.y - rect.top;
			} else if (currentSide.includes('n')) {
				height = rect.bottom - pos.y;
			}
			node.style.width = `${width}px`;
			node.style.height = `${height}px`;
			params.onresize?.({ side: currentSide, node, event: e, height, width });

			return;
		}
		document.body.style.userSelect = '';

		const all =
			params.sides?.all ??
			(params.sides?.top === undefined &&
				params.sides?.left === undefined &&
				params.sides?.bottom === undefined &&
				params.sides?.right === undefined);
		
		const top = params.sides?.top ?? all;
		const left = params.sides?.left ?? all;
		const bottom = params.sides?.bottom ?? all;
		const right = params.sides?.right ?? all;
		const threshold = params.threshold ?? defaultThreshold;

		const pos = posFromClient(e);
		const rect = node.getBoundingClientRect();

		const dx = pos.x - rect.left;
		const dy = pos.y - rect.top;
		const w = rect.width;
		const h = rect.height;
		const m = threshold;

		const previousSide = currentSide;
				
		let verticalLetter: 's' | 'n' | '' =  '';
		let horizontalLetter: 'e' | 'w' | '' = '';
		if (left && dx < m) {
			horizontalLetter = 'w';
		} else if (right && dx > w - m) {
			horizontalLetter = 'e';
		}
		if (top && dy < m) {
			verticalLetter = 'n';
		} else if (bottom && dy > h - m) {
			verticalLetter = 's';
		}
		const candidate = verticalLetter + horizontalLetter;
		currentSide = candidate.length > 0 ? candidate as ResizeSide : null;
		if (currentSide !== previousSide) {
			document.body.style.cursor = currentSide !== null ? `${currentSide}-resize` : '';
		}
	}

	if (resizeHandleMap.size === 0) {
		document.addEventListener('pointermove', globalOnpointermove);
	}
	resizeHandleMap.set(node, {
		onpointerenter,
		onpointerleave,
		get threshold() {
			return params.threshold ?? defaultThreshold;
		}
	});

	return {
		destroy() {
			resizeHandleMap.delete(node);
			if (resizeHandleMap.size === 0) {
				document.removeEventListener('pointermove', globalOnpointermove);
			}
		},
		update(newParams) {
			params = newParams;
		}
	};
}
