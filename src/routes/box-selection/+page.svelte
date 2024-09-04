<script lang="ts">
	import { boxSelection } from '$lib';
	import { draggable } from '@neodrag/svelte';

	let boxSelectionEnabled = $state(true);
	let holder = $state<HTMLElement>();
</script>

<h1 class="text-2xl font-bold m-auto mb-4">Box Selection</h1>
<div
	use:boxSelection={{
		enabled: boxSelectionEnabled,
		holder,
		onselection: (nodes) => {
			for (const node of nodes) {
				node.classList.toggle('bg-secondary');
			}
		}
	}}
	class="bg-base-200 h-[50rem] w-[80rem] relative select-none overflow-clip cursor-move">
	<div bind:this={holder} class="h-full w-full" use:draggable>
		{#snippet Button(label: string, x: number, y: number)}
			<button
				type="button"
				class="pointer-events-auto absolute w-[10rem] h-[10rem] bg-base-300 grid place-content-center text-xl font-semibold"
				style="left: {x}rem; top: {y}rem"
				onclick={(e) => e.currentTarget.classList.toggle('bg-secondary')}>
				{label}
			</button>
		{/snippet}
		{@render Button("A", 20, 15)}
		{@render Button("B", 50, 23)}
	</div>
	<button
		class="btn {boxSelectionEnabled ? 'btn-success' : 'btn-neutral'} absolute right-2 top-2"
		onclick={() => (boxSelectionEnabled = !boxSelectionEnabled)}>Toggle Box Selection</button>
</div>
