export function lerp(start: number, end: number, alpha: number) {
    return start + (end - start) * alpha;
}
export type Position = {x: number, y: number}
export function affineFromPoints(p1: Position, p2: Position): (x: number) => number {
    const a = (p2.y - p1.y) / (p2.x - p1.x)
    const b = p2.y - a * p2.x

    return (x: number) => a * x + b
}

export function distance(a: Position, b: Position): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}