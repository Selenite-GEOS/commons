<script lang="ts">
	import Tags from '$lib/components/Tags.svelte';

	let tags: string[] = $state(['Fire', 'Avatar']);
	let knownTags: string[] = $state([
		'Fire',
		'fire',
		'Water',
		'Earth',
		'Air',
		'Harmony',
		'Chi',
		'Energy',
		'Spirit',
		'State',
		'Ghost',
		'Cyborg',
		'Fallen Angel',
		'What'
	]);
	// let knownTags: string[] = [];
</script>

<div>
	<p>
		The <code>Tags</code> component.
	</p>
	<Tags bind:tags {knownTags} class="w-[30rem]" />
	Number of tags : {tags.length}
</div>
