<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import OptimizedDiv from './OptimizedDiv.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		content?: string;
	}

	let { content = '', ...props }: Props = $props();
	const lines = $derived(content.split('\n'));
</script>

<OptimizedDiv {...props}>
	{#each lines as line, i (line)}
		{#each line.split('\t') as piece, j}
			{piece}{#if j < line.length - 1}&emsp;{/if}
		{/each}
		{#if i < lines.length - 1}
			<br />
		{/if}
	{/each}
</OptimizedDiv>
