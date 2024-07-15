import { lerp } from '$lib/utils';
import type { Action } from 'svelte/action';

export type Transform = { x: number; y: number; k: number };

function drawLines({
		canvas,
		transform,
		spacing: baseSpacing = 80,
		color = '#ddd',
		width = 0.08
	}: {
		canvas: HTMLCanvasElement;

		transform: Transform;
		spacing?: number;
		color?: string;
		width?: number;
	}) {
		if (transform.k < 0.01) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Canvas is not a 2d canvas.');
		}
		ctx.save();
		ctx.beginPath();
		const scalingFactor = Math.floor(1 + -Math.log(transform.k) / Math.log(3));
		const spacing = scalingFactor > 0 ? baseSpacing * scalingFactor : baseSpacing;
		// console.debug('spacing\t', spacing);
		const step = spacing * transform.k;
		// console.debug('gg\t', transform.k);
		
		// Draw vertical lines
		for (let x = (transform.x % step) - step; x <= canvas.width; x += step) {
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
		}

		// Draw horizontal lines
		for (let y = (transform.y % step) - step; y <= canvas.height; y += step) {
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
		}
		// Stroke the lines
		ctx.strokeStyle = color;
		ctx.lineWidth = transform.k > 0.1 ? width : lerp(0,width, (transform.k - 0.01) / 0.09);
		ctx.stroke();
		ctx.restore();
	}

export const gridLines: Action<HTMLCanvasElement, Omit<Parameters<typeof drawLines>[0], 'canvas'> & {visibility?: boolean}>  = (
	canvas,
	params
) => {
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Canvas is not a 2d canvas.');
	}

	if (params.visibility ?? true)
		drawLines({ ...params, canvas });

	return {
		destroy() {},
		update(params) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			if (params.visibility ?? true)
				drawLines({ canvas, ...params });
		}
	};
};
