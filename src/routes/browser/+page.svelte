<script lang="ts">
	import { Browser, Input } from '$lib';
	import type { Filter, FilterDefinition } from '$lib/components/filter';
	import MatchHighlighter from '$lib/components/MatchHighlighter.svelte';
	import { fade } from 'svelte/transition';
	type Item = { label: string; path?: string[], tags?: string[] };
	const items: Item[] = [
		{ label: 'D', path: ['Folder 2'] },
		{
			label: 'A',
			path: []
		},
		{ label: 'B', path: [] },
		{ label: 'Atom', path: [], tags:['particle'] },
		{ label: 'Molecule', tags: ['particle'] },
		{ label: 'Photon', tags: ['particle', 'light'] },
		{ label: 'Quark', tags: ['particle'] },
		{ label: 'Muse', tags: ['music'] },
		{ label: 'Metallica', tags: ['music'] },
		{ label: 'ACDC', tags: ['music'] },
		{ label: 'Avatar', tags: ['music'] },
		{ label: 'C1', path: ['Folder 1'] },
		{ label: 'C2', path: ['Folder 1'] },
		{ label: 'E', path: ['Folder 1', 'Folder 1-1'] }
	];
	let query = $state('')
	let filters  = $state<Filter<Item>[]>([{active: false, key: 'tags', value: 'particle'}])
	let filterDefs  = $state<FilterDefinition<Item>[]>([
		{
			key: 'tags',
		}
	])
	const knownTags = ["particle", "light", "music"];

	let cols = $state(4)
</script>
<div class="m-auto">
<Input type="number" label="Columns" bind:value={cols} class="w-12"/>
</div>
<div class="border h-[45rem] rounded-box border-base-content border-opacity-30 p-4">
	<Browser {cols} {items} {knownTags} {filterDefs} bind:filters bind:query>
		<!-- {#snippet Folder()}
    {/snippet} -->
		{#snippet Item({ label })}
			<article
				class="flex flex-col items-center cursor-pointer bg-base-300 rounded-box p-4 border border-base-content border-opacity-15 overflow-clip"
				in:fade
				out:fade={{ duration: 50 }}
				draggable="true">
				<div class="text-nowrap truncate size-16 flex flex-col items-center">
					<MatchHighlighter content={label} ref={query}/>
				</div>
			</article>
			<!-- <h2></h2> -->
		{/snippet}
	</Browser>
</div>
