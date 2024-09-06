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

{#if parts.length <= 1}
	{content}
{:else}
	<span>
		{#each parts as { match, part }}
			{#if match}
				<mark class="bg-accent text-accent-content" class:outline class:outline-accent={outline}
					>{part}</mark>
			{:else}
				{part}
			{/if}
		{/each}
	</span>
{/if}
