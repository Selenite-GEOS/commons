/**
 * Actions to add scrolling behavior, like custom scrolling or scroll into view.
 *
 * @see {@link horizontalScroll}
 * @see {@link scrollIntoView}
 * @module
 */
import { clamp, debounce } from 'lodash-es';
import type { Action } from 'svelte/action';
import { tweened } from 'svelte/motion';
import { get } from 'svelte/store';

/**
 * Adds horizontal scrolling to an element.
 *
 * This action removes the needs to press ctrl or right to scroll
 * horizontally.
 * @param node - The element to add horizontal scrolling to.
 * @param params - The duration of the scroll animation.
 * @returns svelte action
 */
export const horizontalScroll: Action<HTMLElement, { duration?: number } | undefined> = (
	node,
	{ duration = 150 } = {}
) => {
	let isActionScroll = false;
	let scroll = tweened(node.scrollLeft, {
		duration,
		interpolate: (a, b) => (t) => a + (b - a) * t
	});
	let isFirst = true;
	scroll.subscribe((value) => {
		if (isFirst) {
			isFirst = false;
			return;
		}
		if (!isActionScroll) return;
		node.scrollLeft = value;
	});

	const stopClamingScroll = debounce(
		() => {
			isActionScroll = false;
		},
		duration,
		{ leading: false, trailing: true }
	);

	const handleWheel = (e: WheelEvent) => {
		if (e.deltaY === 0) return;
		isActionScroll = true;
		const firstChildRect = node.firstElementChild?.getBoundingClientRect();
		const lastChildRect = node.lastElementChild?.getBoundingClientRect();
		if (!firstChildRect || !lastChildRect) {
			console.warn('Horizontal scroll: No children found');
			return;
		}
		// Ensure offset stays valid
		const maxOffset = lastChildRect.width + lastChildRect.x - firstChildRect.x;
		scroll.set(clamp(node.scrollLeft + e.deltaY, 0, maxOffset));
		e.preventDefault();
		stopClamingScroll();
	};

	node.addEventListener('wheel', handleWheel, { passive: false });

	node.addEventListener('scroll', (e) => {
		if (!isActionScroll) {
			scroll.set(node.scrollLeft);
		}
	});
	return {
		destroy() {
			node.removeEventListener('wheel', handleWheel);
		}
	};
};

/**
 * Scrolls into view an element.
 */
export const scrollIntoView: Action<HTMLElement, boolean | undefined> = (node, enabled) => {
	const parent = node.parentElement;
	if (!parent) return;

	if (!enabled) return;

	const parentRect = parent.getBoundingClientRect();
	const nodeRect = node.getBoundingClientRect();
	parent.scrollTo({
		left: nodeRect.left - parentRect.left,
		top: nodeRect.top - parentRect.top,
		behavior: 'smooth'
	});
};
