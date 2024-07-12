import { isArray } from 'lodash-es';
import type { Action } from 'svelte/action';

type KeyboardShortcut = {
	key: string;
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
};
type ShortcutSettings = {
	shortcuts: KeyboardShortcut[] | ((e: KeyboardEvent) => boolean) | KeyboardShortcut;
	action?: (e: KeyboardEvent) => unknown;
	ignoreElements?: string[];
};
function makeShortcutListener(params: ShortcutSettings): (e: KeyboardEvent) => void {
	const { shortcuts, action, ignoreElements = ['INPUT', 'TEXTAREA'] } = params;

	return (e) => {
		const target = e.target;
		if (!(target instanceof HTMLElement)) return;

		if (ignoreElements.includes(target?.tagName) || target.contentEditable === 'true') {
			if (target?.tagName === 'INPUT') {
				const input = target as HTMLInputElement;
				if (input.type !== 'checkbox' && input.type !== 'radio') return;
			}
		}
        let triggeredShortcut: KeyboardShortcut | undefined = undefined
		if (typeof shortcuts === 'function') {
			if (!shortcuts(e)) return;
            triggeredShortcut = { key: e.key, ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey }
		} else {
            for (const shortcut of isArray(shortcuts) ? shortcuts : [shortcuts]) {
                if (
                    e.key.toLowerCase() === shortcut.key.toLowerCase() &&
                    e.ctrlKey === !!shortcut.ctrl &&
                    e.altKey === !!shortcut.alt &&
                    e.shiftKey === !!shortcut.shift
                ) {
                    triggeredShortcut = shortcut
                    break
                }
            }
            if (!triggeredShortcut) return;
        }

		e.preventDefault();

		console.log(`shortcut: ${shortcutToString(triggeredShortcut)}`);
		if (action) action(e);
	};
}

export function shortcutToString({ ctrl, alt, shift, key }: KeyboardShortcut): string {
	const pieces = [];
	if (ctrl) pieces.push('Ctrl');
	if (alt) pieces.push('Alt');
	if (shift) pieces.push('Shift');
	pieces.push(key.toUpperCase());
	return pieces.join('+');
}

export const shortcut: Action<HTMLElement, ShortcutSettings> = (node, params) => {
	let listener = makeShortcutListener(params);

	document.addEventListener('keydown', listener);

	return {
		destroy() {
			document.removeEventListener('keydown', listener);
		},
		update(params) {
			document.removeEventListener('keydown', listener);
			listener = makeShortcutListener(params);
			document.addEventListener('keydown', listener);
		}
	};
};
