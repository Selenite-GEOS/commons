<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { children, ...props }: Props = $props();
</script>

{#if children}
	{#if Object.keys(props).length === 0}
		{@render children()}
    {:else}
        <div {...props}>
            {@render children()}
        </div>
	{/if}
{/if}
