import type { Action } from "svelte/action";

export const horizontalScroll: Action = (node) => {
    const handleWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        node.scrollLeft += e.deltaY;
        e.preventDefault();
    };
    node.addEventListener("wheel", handleWheel, { passive: false });
    return {
        destroy() {
        node.removeEventListener("wheel", handleWheel);
        },
    };
}