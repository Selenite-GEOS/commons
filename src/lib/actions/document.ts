import type { Action } from 'svelte/action';

export type DocumentParams = {
	[key in keyof DocumentEventMap]?: (event: DocumentEventMap[key]) => void;
} & AddEventListenerOptions;

/**
 * Action to listen to events on the document.
 * @param node node the action is bound to
 * @param params the listeners and the listeners options combined
 * @returns svelte action
 */
export const documentListener: Action<Element, DocumentParams> = (node, params: DocumentParams) => {
	function setup() {
		Object.keys(params).forEach((key) => {
			const p = params as Record<string, EventListener | boolean>;
			if (typeof p[key] !== 'function') return;
			document.addEventListener(key, p[key], params);
		});
	}
	setup();

	return {
		destroy() {
			Object.keys(params).forEach((key) => {
				const p = params as Record<string, EventListener | boolean>;
				if (typeof p[key] !== 'function') return;
				document.removeEventListener(key, p[key], params);
			});
		},
		update(parameter) {
			this.destroy?.();
			params = parameter;
			setup();
		}
	};
};
