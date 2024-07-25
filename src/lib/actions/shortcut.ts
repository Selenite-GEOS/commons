import { isArray } from 'lodash-es';
import type { Action, ActionReturn } from 'svelte/action';

export type KeyboardShortcut = {
	key?: string;
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
};
export type ShortcutSettings<E extends Element> = KeyboardShortcut & {
	shortcuts?: KeyboardShortcut[] | ((e: KeyboardEvent) => boolean) | KeyboardShortcut;
	action?: (node: E, e: KeyboardEvent) => unknown;
	ignoreElements?: string[];
	endAction?: (node: E, e: KeyboardEvent) => void;
};
function makeShortcutListener<E extends Element>(node: E, params: ShortcutSettings<E>): (e: KeyboardEvent) => void {
	const {
		shortcuts = [],
		key,
		alt,
		shift,
		ctrl,
		action,
		ignoreElements = ['INPUT', 'TEXTAREA']
	} = params;
	const shortShortcutDef: KeyboardShortcut | undefined = key
		? {
				key,
				ctrl,
				alt,
				shift
			}
		: undefined;

	return (e) => {
		const target = e.target;
		if (!(target instanceof HTMLElement)) return;

		if (ignoreElements.includes(target?.tagName) || target.contentEditable === 'true') {
			if (target?.tagName === 'INPUT') {
				const input = target as HTMLInputElement;
				if (input.type !== 'checkbox' && input.type !== 'radio') return;
			} else {
				return;
			}
		}
		let triggeredShortcut: KeyboardShortcut | undefined = undefined;
		if (shortShortcutDef && isShortcutTriggered(e, shortShortcutDef)) {
			triggeredShortcut = shortShortcutDef;
		} else if (typeof shortcuts === 'function') {
			if (!shortcuts(e)) return;
			triggeredShortcut = { key: e.key, ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey };
		} else {
			for (const shortcut of isArray(shortcuts) ? shortcuts : [shortcuts]) {
				if (isShortcutTriggered(e, shortcut)) {
					triggeredShortcut = shortcut;
					break;
				}
			}
		}
		if (!triggeredShortcut) return;

		e.preventDefault();

		console.debug(`shortcut: ${shortcutToString(triggeredShortcut)}`);
		if (action) action(node, e);
		if (params.endAction) {
			function triggerEndAction(e: KeyboardEvent) {
				console.debug("Trigger end action.")
				params.endAction?.(node, e)
				document.removeEventListener('keyup', triggerEndAction);
			}
			document.addEventListener('keyup', triggerEndAction);
		}
	};
}

function isShortcutTriggered(e: KeyboardEvent, shortcut: KeyboardShortcut) {
	return shortcut.key === undefined
		? true
		: e.key.toLowerCase() === shortcut.key.toLowerCase() &&
				e.ctrlKey === !!shortcut.ctrl &&
				e.altKey === !!shortcut.alt &&
				e.shiftKey === !!shortcut.shift;
}

export function shortcutToString({ ctrl, alt, shift, key }: KeyboardShortcut): string {
	const pieces = [];
	if (ctrl) pieces.push('Ctrl');
	if (alt) pieces.push('Alt');
	if (shift) pieces.push('Shift');
	if (key) pieces.push(key.toUpperCase());
	return pieces.join('+');
}

/**
 * Action to add a keyboard shortcut.
 * 
 * All keyboard listeners are attached to document.
 * @param node - The element the shortcut is bound to
 * @param params - Settings for the shortcut
 * @returns svelte action to add a keyboard shortcut
 */
export function shortcut<E extends Element>(node: E, params: ShortcutSettings<E>): ActionReturn<ShortcutSettings<E>> {
		let listener = makeShortcutListener(node, params);

		document.addEventListener('keydown', listener);

		return {
			destroy() {
				document.removeEventListener('keydown', listener);
			},
			update(params) {
				document.removeEventListener('keydown', listener);
				listener = makeShortcutListener(node, params);
				document.addEventListener('keydown', listener);
			}
		};

}
