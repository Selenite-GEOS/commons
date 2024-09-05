import type { Action } from 'svelte/action';

export type DocumentParams = {
    [key in keyof DocumentEventMap]?: (event: DocumentEventMap[key]) => void;
} & AddEventListenerOptions;
export const documentListener: Action<Element, DocumentParams> = (node, params: DocumentParams) => {
	function setup() {
		Object.keys(params).forEach((key) => {
			// @ts-expect-error Ignore type error
			document.addEventListener(key, params[key], params);
		});
	}
    setup()

	return {
		destroy() {
			Object.keys(params).forEach((key) => {
				// @ts-expect-error Ignore type error
				document.removeEventListener(key, params[key], params);
			});
		},
		update(parameter) {
            this.destroy?.()
            params = parameter;
            setup()
        },
	};
};