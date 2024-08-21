import type { Action } from 'svelte/action';
export * as FocusTrap from './focusTrap';
export * from './focusTrap';
export * as Shortcut from './shortcut';
export * from './shortcut';
export * as Canvas from './canvas';
export * from './canvas';
export * as Scroll from './scroll';
export * from './scroll';
export * as Inputs from './inputs';
export * from './inputs';
export * as Drag from './drag';
export * from './drag';
export * as Click from './click';
export * from './click';
let handleFocusLeaveRefCount = 0;
let handleFocusLeaveCallbacks: ((isKeyboard: boolean) => void)[] = [];
function handleKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape') {
		if (handleFocusLeaveCallbacks.length === 0) return;
		const callback = handleFocusLeaveCallbacks.pop();
		callback!(true);
	}
}

export const handleFocusLeave: Action<HTMLElement, (isKeyboard: boolean) => void> = (
	node,
	callback
) => {
	if (handleFocusLeaveRefCount === 0) {
		document.addEventListener('keydown', handleKeydown);
	}
	handleFocusLeaveRefCount++;
	handleFocusLeaveCallbacks.push(callback);
	function handleFocusIn(e: Event) {}

	function handleFocusOut() {
		requestAnimationFrame(() => {
			if (!node.contains(document.activeElement)) {
				const closestPopup = document.activeElement?.closest('.popup');
				let isDescendantOfPopup = closestPopup !== null && closestPopup !== undefined;
				if (isDescendantOfPopup) return;
				callback(false);
				handleFocusLeaveCallbacks.pop();
			}
		});
	}

	document.addEventListener('focusin', handleFocusIn);
	document.addEventListener('focusout', handleFocusOut);

	// node.addEventListener("focusout", () => console.debug(document.activeElement))

	return {
		destroy() {
			handleFocusLeaveRefCount--;

			document.removeEventListener('focusin', handleFocusIn);
			document.removeEventListener('focusout', handleFocusOut);
			if (handleFocusLeaveRefCount === 0) document.removeEventListener('keydown', handleKeydown);
		}
	};
};

export const takeFocus: Action<HTMLElement, boolean> = (node, active) => {
	if (!active) return;
	setTimeout(() => node.focus());
};

export * from './focusTrap';
