<script lang="ts" generics="T">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Filter } from '$lib/utils';

	interface Props extends HTMLButtonAttributes {
		filter: Filter<T>;
	}

	let { filter = $bindable(), ...props }: Props = $props();
	const loweredKey = $derived(String(filter.key).trim().toLowerCase());
	const isTag = $derived(loweredKey === 'tag' || loweredKey === 'tags');
</script>

<button
	type="button"
	{...props}
	class="transition-colors badge hover:outline-1 hover:outline-accent {filter.active
		? 'badge-secondary'
		: 'badge-ghost'} {props.class}">
	{#if !isTag}{filter.key}:
	{/if}{filter.value}
</button>
