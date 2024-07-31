import type { Action } from 'svelte/action';
import baseAutosize from 'autosize';

export const autosize: Action<HTMLTextAreaElement> = (textarea) => {
	baseAutosize(textarea);

	// $effect.root()

	return {
		destroy() {
			baseAutosize.destroy(textarea);
		}
	};
};
