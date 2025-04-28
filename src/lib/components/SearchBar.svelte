<script lang="ts">
	import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import Button from './Button.svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	interface Props extends HTMLLabelAttributes {
		query?: string;
	}

	let { query = $bindable(''), ...props }: Props = $props();
	let searchInput = $state<HTMLInputElement>();
</script>

<label role="search" {...props} class="flex gap-2 input items-center mb-2 {props.class}">
	<input bind:this={searchInput} bind:value={query} placeholder="Search" class="grow" />
	{#if query.trim().length > 0}
		<Button class="btn-xs btn-circle btn-ghost" onclick={() => (query = '')}>
			<Fa icon={faTimes} />
		</Button>
	{/if}
	<button type="button" onclick={() => searchInput?.focus()}>
		<Fa icon={faSearch} />
	</button>
</label>
