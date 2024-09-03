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
export const checkbox: Action<HTMLInputElement, boolean | undefined> = (node, enabled : boolean | undefined = true ) => {
	if (!isCheckboxSetup) {
		isCheckboxSetup = true;
		document.addEventListener('pointerdown', (event) => {
			pointedDownCheckbox =
				event.target instanceof HTMLInputElement &&
				event.target.type === 'checkbox' &&
				event.target.dataset['seleniteCheckbox'] === 'true'
					? event.target
					: undefined;
			if (pointedDownCheckbox) {
				document.body.style.userSelect = 'none';
			}
		}, {capture: true});
		document.addEventListener('pointerup', () => {
			document.body.style.userSelect = '';
			pointedDownCheckbox = undefined;
		}, {capture: true});
	}

	function triggerOnEnter(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			node.click();
		}
	}

	function triggerOnHoverWhenPointerDown() {
		if (pointedDownCheckbox && pointedDownCheckbox !== node) {
			node.click();
		}
	}

	function triggerOnLeaveWhenPointerDown() {
		if (pointedDownCheckbox === node) {
			node.click();
		}
	}
	function setup() {
		node.dataset['seleniteCheckbox'] = 'true';
		node.addEventListener('keydown', triggerOnEnter);
		node.addEventListener('pointerenter', triggerOnHoverWhenPointerDown);
		node.addEventListener('pointerleave', triggerOnLeaveWhenPointerDown);
	}

	function destroy() {
		node.dataset['seleniteCheckbox'] = 'false';
		node.removeEventListener('keydown', triggerOnEnter);
		node.removeEventListener('pointerenter', triggerOnHoverWhenPointerDown);
		node.removeEventListener('pointerleave', triggerOnLeaveWhenPointerDown);
	}

	if (enabled) setup();

	return {
		destroy,
		update(enabled) {
			if (enabled ?? true) {
				setup();
			} else {
				destroy();
			}
		}
	};
};
