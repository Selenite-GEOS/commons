<script>
	import { gridLines } from '$lib/actions/canvas';

	let x = $state(0);
	let y = $state(0);
</script>

<label>
	<span>x</span>
	<input type="range" bind:value={x} min="-100" max="100" />
	<span class="number">{x}</span>
</label>
<label>
	<span>y</span>
	<input type="range" bind:value={y} min="-100" max="100" />
	<span class="number">{y}</span>
</label>
<div class="container">
	<canvas use:gridLines  style="transform: translate({x}px, {y}px);"> </canvas>
</div>

<style>
	.number {
		width: 2rem;
		text-align: end;
	}
	label {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.container {
		width: 20rem;
		height: 20rem;
		overflow: hidden;
	}

	canvas {
		/* width: 100%;
		height: 100%; */
	}
</style>
