import type { Action } from 'svelte/action';
import baseAutosize from 'autosize';


/**
 * Action to make a textarea autosize.
 * 
 * A parameter can be passed to the action to trigger an update when it changes.
 * @param {HTMLTextAreaElement} textarea - The textarea element to make autosize.
 */
export const autosize: Action<HTMLTextAreaElement, unknown | undefined> = (textarea) => {
	baseAutosize(textarea);

	return {
		destroy() {
			baseAutosize.destroy(textarea);
		},
		update() {
			baseAutosize.update(textarea);
		}
	};
};
