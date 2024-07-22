import type { Action } from 'svelte/action';
import { tweened } from 'svelte/motion';
import { get } from 'svelte/store';

export const horizontalScroll: Action<HTMLElement, { duration?: number } | undefined> = (
	node,
	{ duration = 150 } = {}
) => {
	let scroll = tweened(node.scrollLeft, {
		duration,
		interpolate: (a, b) => (t) => a + (b - a) * t
	});

	scroll.subscribe((value) => {
		node.scrollLeft = value;
	});

	const handleWheel = (e: WheelEvent) => {
		if (e.deltaY === 0) return;
		scroll.set(get(scroll) + e.deltaY);
		e.preventDefault();
	};

	node.addEventListener('wheel', handleWheel, { passive: false });
	return {
		destroy() {
			node.removeEventListener('wheel', handleWheel);
		}
	};
};
