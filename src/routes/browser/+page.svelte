<script lang="ts">
	import { Browser, Input, type Filter, type FilterDefinition } from '$lib';
	type Item = { label: string; path?: string[]; tags?: string[]; descr?: string };
	let items: Item[] = $state([
		{ label: 'D', path: ['Folder 2'] },
		{
			label: 'A',
			path: []
		},
		{ label: 'B', path: [] },
		{ label: 'B', path: ['Folder 3'] },
		{ label: 'B', path: ['Folder 4'] },
		{ label: 'Atom', path: [], tags: ['particle'], descr: 'A small fundamental particle.' },
		{ label: 'Molecule', tags: ['particle'] },
		{ label: 'Photon', tags: ['particle', 'light', 'quantum'] },
		{ label: 'Tachyon', tags: ['particle', 'speed'], path: ['Fast'] },
		{ label: 'Quark', tags: ['particle'] },
		{ label: 'Muse', tags: ['music'] },
		{ label: 'Metallica', tags: ['music'] },
		{ label: 'ACDC', tags: ['music'] },
		{ label: 'Avatar', tags: ['music'] },
		{ label: 'C1', path: ['Folder 1'] },
		{ label: 'C2', path: ['Folder 1'] },
		{ label: 'E', path: ['Folder 1', 'Folder 1-1'] }
	]);
	let query = $state('');
	let filters = $state<Filter<Item>[]>([
		{ active: false, key: 'tags', value: 'particle' },
		{ active: false, key: 'tags', value: 'quantum' }
	]);
	let filterDefs = $state<FilterDefinition<Item>[]>([
		{
			key: 'tags'
		}
	]);
	const knownTags = ['particle', 'light', 'music'];

	let cols = $state(4);
</script>

<div class="m-auto">
	<Input type="number" label="Columns" bind:value={cols} class="w-24" />
</div>
<div class="border h-[45rem] rounded-box border-base-content border-opacity-30 p-4">
	<Browser {cols} bind:items {knownTags} {filterDefs} bind:filters bind:query />
</div>
