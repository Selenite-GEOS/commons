import type { Action, ActionReturn } from 'svelte/action';
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

let isCheckboxSetup = false;
let pointedDownCheckbox: HTMLInputElement | undefined = undefined;
export const checkbox: Action<HTMLInputElement> = (node) => {
	if (!isCheckboxSetup) {
		isCheckboxSetup = true;
		document.addEventListener('pointerdown', (event) => {
			pointedDownCheckbox =
				event.target instanceof HTMLInputElement && event.target.classList.contains('checkbox')
					? event.target
					: undefined;
			console.log(pointedDownCheckbox);
		});
		document.addEventListener('pointerup', () => {
			pointedDownCheckbox = undefined;
			console.log(pointedDownCheckbox);
		});
	}
	node.type = 'checkbox';
	node.classList.add('checkbox');

	function triggerOnEnter(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			node.click();
		}
	}
	node.addEventListener('keydown', triggerOnEnter);

	function triggerOnHoverWhenPointerDown() {
		if (pointedDownCheckbox && pointedDownCheckbox !== node) {
			node.click();
		}
	}

	node.addEventListener('pointerenter', triggerOnHoverWhenPointerDown);

	function triggerOnLeaveWhenPointerDown() {
		if (pointedDownCheckbox === node) {
			node.click();
		}
	}
	node.addEventListener('pointerleave', triggerOnLeaveWhenPointerDown);

	return {
		destroy() {
			node.removeEventListener('keydown', triggerOnEnter);
			node.removeEventListener('pointerenter', triggerOnHoverWhenPointerDown);
			node.removeEventListener('pointerleave', triggerOnLeaveWhenPointerDown);
		}
	};
};
