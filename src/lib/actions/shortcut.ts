import type { Action } from 'svelte/action';

type KeyboardShortcut = {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
};
type ShortcutSettings = {
    shortcuts: KeyboardShortcut[] | ((shortcut: KeyboardShortcut) => boolean) | KeyboardShortcut;
    action?: () => unknown;
    ignoreElements?: string[];
};
function makeShortcutListener(
    params: ShortcutSettings
): (e: KeyboardEvent) => void {
    const {
        shortcuts,
        action,
        ignoreElements = ['INPUT', 'TEXTAREA'],
    } = params;

    return (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;

        if (
            ignoreElements.includes(target?.tagName) ||
            target.contentEditable === 'true'
        ) {
            if (target?.tagName === 'INPUT') {
                const input = target as HTMLInputElement;
                if (input.type !== 'checkbox' && input.type !== 'radio') return;
            }
        }
        if (typeof shortcuts === 'function') {

        }
        if (
            e.key.toLowerCase() !== key.toLowerCase() ||
            e.ctrlKey !== ctrl ||
            e.altKey !== alt ||
            e.shiftKey !== shift
        )
            return;

        e.preventDefault();
        
        // console.log(`shortcut: ${}`);
        if (action) action();
    };
}

export function shortcutToString({ctrl, alt, shift, key}: KeyboardShortcut): string {
    const pieces = [];
    if (ctrl) pieces.push('Ctrl');
    if (alt) pieces.push('Alt');
    if (shift) pieces.push('Shift');
    pieces.push(key.toUpperCase());
    return pieces.join('+')
}

export const shortcut: Action<HTMLElement, ShortcutSettings> = (
    node,
    params
) => {
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
        },
    };
};
