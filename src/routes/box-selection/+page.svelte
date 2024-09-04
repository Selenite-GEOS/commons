<script lang="ts">
	import { boxSelection } from '$lib';

	let boxSelectionEnabled = $state(true);
</script>

<h1 class="text-2xl font-bold m-auto mb-4">Box Selection</h1>
<div
	use:boxSelection={{ enabled: boxSelectionEnabled, onselection: (nodes) => {
        for (const node of nodes) {
            node.classList.toggle('bg-secondary');
        }
    } }}
	class="bg-base-200 h-[50rem] w-[80rem] relative select-none">
	<div
		class="absolute left-[20rem] top-[15rem] w-[10rem] h-[10rem] bg-base-300 grid place-content-center text-xl font-semibold">
		A
	</div>
	<div
		class="absolute right-[20rem] bottom-[15rem] w-[10rem] h-[10rem] bg-base-300 grid place-content-center text-xl font-semibold">
		B
	</div>
	<button
		class="btn {boxSelectionEnabled ? 'btn-success' : 'btn-neutral'} absolute right-2 top-2"
		onclick={() => (boxSelectionEnabled = !boxSelectionEnabled)}>Toggle Box Selection</button>
</div>
