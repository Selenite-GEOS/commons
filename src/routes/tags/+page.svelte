<script lang="ts">
	import Tags from '$lib/components/Tags.svelte';

	let tags: string[] = $state(["Fire", "Avatar"]);
	let knownTags: string[] = $state(["Fire", "Water", "Earth", "Air", "Harmony", "Chi", "Energy", "Spirit", "State", "Ghost", "Cyborg", "Fallen Angel", "What"]);
</script>

<Tags bind:tags {knownTags} class="max-w-[20rem]"/>
