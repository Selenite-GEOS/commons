<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {}

	let { children, ...props }: Props = $props();
</script>

<button type="button" {...props} class="btn {props.class}">
	{#if children}
		{@render children()}
	{/if}
</button>
