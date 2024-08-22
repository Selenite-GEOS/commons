import type { Action } from 'svelte/action';

export {};

export const keyboardNavigation: Action<HTMLElement> = (node) => {
	node.classList.add('selenite-kb-nav');

	function handleKeydown(e: KeyboardEvent) {
		if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;
		const getNext: (node: HTMLElement) => Element | null | undefined =
			e.key === 'ArrowUp'
				? (node) => node.previousElementSibling ?? node.parentElement?.lastElementChild
				: (node) => node.nextElementSibling ?? node.parentElement?.firstElementChild;

		let candidate: HTMLElement | undefined;
		while ((!candidate || !candidate.classList.contains('selenite-kb-nav')) && candidate !== node) {
			const next = getNext(node);
			if (next instanceof HTMLElement) {
				candidate = next;
			}
		}
		if (candidate && candidate.classList.contains('selenite-kb-nav')) {
			candidate.focus();
		}
	}
	function handleFocusIn(e: Event) {
		console.debug('Add keydown listener');
		node.addEventListener('keydown', handleKeydown);
	}
	function handleFocusOut(e: Event) {
		console.debug('Remove keydown listener');
		node.removeEventListener('keydown', handleKeydown);
	}

	document.addEventListener('focusin', handleFocusIn);
	document.addEventListener('focusout', handleFocusOut);

	return {
		destroy() {
			document.removeEventListener('focusin', handleFocusIn);
			document.removeEventListener('focusout', handleFocusOut);
		}
	};
};
