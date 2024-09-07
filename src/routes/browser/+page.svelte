<script lang="ts">
	import { Browser } from '$lib';
	type Item = { label: String; path: string[] };
	const items: Item[] = [
		{
			label: 'A',
			path: []
		},
		{ label: 'B', path: [] },
		{ label: 'C1', path: ['Folder 1'] },
		{ label: 'C2', path: ['Folder 1'] },
        { label: 'D', path: ['Folder 2']},
        {label: 'E', path: ['Folder 1', 'Folder 1-1']}
	];
</script>

<div class="dborder">
	<Browser {items}>
		<!-- {#snippet Folder()}
    {/snippet} -->
		{#snippet Item({ label })}
				{label}
				<!-- <h2></h2> -->
		{/snippet}
	</Browser>
</div>
