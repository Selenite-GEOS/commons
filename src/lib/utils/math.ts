export function lerp(start: number, end: number, alpha: number) {
    return start + (end - start) * alpha;
}