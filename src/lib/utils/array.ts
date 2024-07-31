export function sortedByIndex<T extends { index: number }>(a: T[]): T[] {
	return a.toSorted((a, b) => a.index - b.index);
}
