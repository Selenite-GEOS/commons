<script lang="ts">
	import { matchingParts } from '$lib/utils';

	interface Props {
		content?: string;
		ref?: string;
		caseInsensitive?: boolean;
		outline?: boolean;
	}

	let { content = '', ref = '', caseInsensitive = true, outline = false }: Props = $props();
	const parts = $derived(matchingParts(content, ref, { caseInsensitive }));
</script>

{#snippet highlightPart({ match = false, part = '' } = {})}
	{#if match}
		<mark class="bg-accent text-accent-content" class:outline class:outline-accent={outline}
			>{part}</mark>
	{:else}
		{part}
	{/if}
{/snippet}

{#if parts.length <= 1}
	{@render highlightPart(parts[0])}
{:else}
	<span>
		{#each parts as part}
			{@render highlightPart(part)}
		{/each}
	</span>
{/if}
