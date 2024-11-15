import type { Action } from 'svelte/action';

export const autofocus: Action<HTMLElement, boolean | undefined> = (node, active = true) => {
	if (!active) return;
	setTimeout(() => node.focus());

	return {
		update(a) {
			if (a) node.focus();
		}
	};
};
