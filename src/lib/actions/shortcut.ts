/**
 * Svelte action to add keyboard shortcuts.
 *
 * @see {@link shortcut}
 * @module
 */

import { isArray } from 'lodash-es';
import type { ActionReturn } from 'svelte/action';

/**
 * Basic definition of a keyboard shortcut based on key and modifier keys.
 */
export type KeyboardShortcut = {
	/** Keyboard key. */
	key?: string;
	/** Needs ctrl ? */
	ctrl?: boolean;
	/** Needs alt ? */
	alt?: boolean;
	/** Needs shift ? */
	shift?: boolean;
};

/**
 * Settings for a keyboard shortcut.
 */
export type ShortcutSettings<E extends Element> = KeyboardShortcut & {
	/** List of shortcuts that trigger the action.
	 *
	 * Can be a single shortcut or an array of shortcuts.
	 * If a function is provided, it should return a boolean
	 * indicating whether the shortcut is triggered
	 * based on the keyboard event.
	 */
	shortcuts?: KeyboardShortcut[] | ((e: KeyboardEvent) => boolean) | KeyboardShortcut;

	/** Callback to be triggered when shortcut is activated. */
	action?: (node: E, e: KeyboardEvent) => unknown;

	/** Element types that prevents the shortcut from triggering.
	 *
	 *  Defaults to ['INPUT', 'TEXTAREA']. */
	ignoreElements?: string[];

	/** Callback to be triggered when key is released. */
	endAction?: (node: E, e: KeyboardEvent) => void;

	/** Should keep triggering if key is still pressed ?
	 *
	 * Defaults to true. */
	repeats?: boolean;
};

/**
 * Returns a listener function that checks if a keyboard shortcut is triggered.
 * @param node - node the shortcut is bound to
 * @param params - settings of the shortcut
 * @returns keyboard listener
 */
function makeShortcutListener<E extends Element>(
	node: E,
	params: ShortcutSettings<E>
): (e: KeyboardEvent) => void {
	const {
		shortcuts = [],
		key,
		alt,
		shift,
		ctrl,
		action,
		ignoreElements = ['INPUT', 'TEXTAREA']
	} = params;
	const shortShortcutDef: KeyboardShortcut | undefined =
		key || ctrl || alt || shift
			? {
					key,
					ctrl,
					alt,
					shift
				}
			: undefined;

	let triggered = false;
	return (e) => {
		if (params.repeats === false && triggered) return;
		const target = e.target;
		if (target instanceof HTMLElement) {
			if (ignoreElements.includes(target?.tagName) || target.contentEditable === 'true') {
				if (target?.tagName === 'INPUT') {
					const input = target as HTMLInputElement;
					if (input.type !== 'checkbox' && input.type !== 'radio') return;
				} else {
					return;
				}
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

		// Prevent default behavior if key is defined
		// We don't want to prevent default behavior if only
		// modifier keys are defined
		if (triggeredShortcut.key) e.preventDefault();

		console.debug(`shortcut: ${shortcutToString(triggeredShortcut)}`);
		if (action) action(node, e);
		if (triggered === false) {
			if (params.endAction) {
				function triggerEndAction(e: KeyboardEvent) {
					console.debug('Trigger end action.');
					params.endAction?.(node, e);
					document.removeEventListener('keyup', triggerEndAction);
					triggered = false;
				}
				document.addEventListener('keyup', triggerEndAction);
			}
			triggered = true;
		}
	};
}

/**
 * Returns whether a shortcut definition has been triggered.
 * @param e - keyboard event
 * @param shortcut - shortcut definition
 * @returns whether shortcut is triggered
 */
function isShortcutTriggered(e: KeyboardEvent, shortcut: KeyboardShortcut) {
	return (
		(shortcut.key === undefined ? true : e.key.toLowerCase() === shortcut.key.toLowerCase()) &&
		e.ctrlKey === !!shortcut.ctrl &&
		e.altKey === !!shortcut.alt &&
		e.shiftKey === !!shortcut.shift
	);
}

/**
 * Converts a keyboard shortcut definition to a string.
 * @param param0 - Keyboard shortcut definition
 * @returns
 */
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
export function shortcut<E extends Element>(
	node: E,
	params: ShortcutSettings<E>
): ActionReturn<ShortcutSettings<E>> {
	let listener = makeShortcutListener(node, params);

	document.addEventListener('keydown', listener, { capture: true });

	return {
		destroy() {
			document.removeEventListener('keydown', listener, { capture: true });
		},
		update(params) {
			document.removeEventListener('keydown', listener, { capture: true });
			listener = makeShortcutListener(node, params);
			document.addEventListener('keydown', listener, { capture: true });
		}
	};
}
