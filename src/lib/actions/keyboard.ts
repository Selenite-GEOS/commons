import type { Action, ActionReturn } from 'svelte/action';

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

type KeysHandler<E extends Element> = (e: KeyboardEvent & { target: E }) => void;
type SupportedKeys = 'escape' | 'enter' | 'up' | 'left' | 'down' | 'right' | 'backspace';
type KeysParams<E extends Element> = { [key in SupportedKeys]?: KeysHandler<E> } & {preventDefault?: boolean};
export function keys<E extends HTMLElement>(
	node: E,
	params: KeysParams<E>
): ActionReturn<KeysParams<E>> {
	function kbListener(e_: KeyboardEvent) {
		const e = e_ as KeyboardEvent & { target: E };
		if (params.preventDefault) 
			e.preventDefault();
		
		switch (e.key) {
			case 'ArrowUp':
				params.up?.(e);
				break;
			case 'ArrowLeft':
				params.left?.(e);
				break;
			case 'ArrowDown':
				params.down?.(e);
				break;
			case 'ArrowRight':
				params.right?.(e);
				break;
			case 'Enter':
				params.enter?.(e);
				break;
			case 'Escape':
				params.escape?.(e);
				break;
			case 'Backspace':
				params.backspace?.(e);
				break;
		}
	}

	node.addEventListener('keydown', kbListener);

	return {
		destroy() {
			node.removeEventListener('keydown', kbListener);
		},
		update(newParams = {}) {
			params = newParams;
		}
	};
}
