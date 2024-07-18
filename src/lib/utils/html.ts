import type { Position } from './math';

export function isBrowser() {
	return typeof window !== 'undefined';
}

export function posFromClient({
	clientX: x,
	clientY: y
}: {
	clientX: number;
	clientY: number;
}): Position {
	return { x, y };
}

export function download(filename: string, data: unknown) {
	const text = typeof data === 'string' ? data : JSON.stringify(data, undefined, 4);
	const blob = new Blob([text], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	URL.revokeObjectURL(url);
	document.body.removeChild(a);

}

export function downloadJSON(name: string, data: unknown) {
	const json = JSON.stringify(data, undefined, 4);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${name}.json`;
	document.body.appendChild(a);
	a.click();
	URL.revokeObjectURL(url);
	document.body.removeChild(a);
}
