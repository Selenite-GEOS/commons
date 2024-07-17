import type { Position } from './math';

export function posFromClient({
	clientX: x,
	clientY: y
}: {
	clientX: number;
	clientY: number;
}): Position {
	return { x, y };
}