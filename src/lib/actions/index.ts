import type { Action } from 'svelte/action';
export * as FocusTrap from './focusTrap.js'
export * from './focusTrap.js'
export * as Shortcut from './shortcut.js'
export * from './shortcut.js'
export * as Canvas from './canvas.js'
export * from './canvas.js'
export * as Scroll from './scroll.js'
export * from './scroll.js'
export * as Inputs from './inputs.js'
export * from './inputs.js'
export * as Drag from './drag.js'
export * from './drag.js'
let handleFocusLeaveRefCount = 0;
let handleFocusLeaveCallbacks: ((isKeyboard: boolean) => void)[] = [];
function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        if (handleFocusLeaveCallbacks.length === 0) return;
        const callback = handleFocusLeaveCallbacks.pop();
        callback!(true);
    }
}

export const handleFocusLeave: Action<
    HTMLElement,
    (isKeyboard: boolean) => void
> = (node, callback) => {
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
            if (handleFocusLeaveRefCount === 0)
                document.removeEventListener('keydown', handleKeydown);
        },
    };
};

export const takeFocus: Action<HTMLElement, boolean> = (node, active) => {
    if (!active) return;
    setTimeout(() => node.focus());
};

export * from './focusTrap';
