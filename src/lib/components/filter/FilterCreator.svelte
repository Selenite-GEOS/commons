<script lang="ts" generics="T">
	import { capitalize, uniq } from 'lodash-es';
	import type { Filter, FilterDefinition } from '$lib/utils';
	import { preventDefault, singular } from '$lib/utils';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { autofocus } from '$lib/actions';

	interface Props extends HTMLFormAttributes {
		filterDefs?: FilterDefinition<T>[];
		filters?: Filter<T>[];
		filter?: Filter<T>;
		autofocus?: boolean;
	}

	let {
		filterDefs = [],
		filter = $bindable({
			active: true,
			key: 'tags' as keyof T,
			value: ''
		}),
		filters = $bindable([]),
		autofocus: bAutofocus = true,
		...props
	}: Props = $props();

	const filterTypes = $derived(uniq(filterDefs.map((f) => f.key)));

	let input: HTMLInputElement;
</script>

<form
	{...props}
	class="join border border-base-content border-opacity-15 {props.class}"
	onsubmit={(e) => {
		preventDefault(e);
		props.onsubmit?.(e);
		filters.push($state.snapshot(filter) as Filter<T>);
		filter = $state.snapshot(filter) as Filter<T>;
		requestAnimationFrame(() => {
			input.focus();
			input.select();
		});
	}}>
	<select class="select select-sm join-item font-semibold" bind:value={filter.key}>
		{#each filterTypes as filterType}
			<option value={filterType} selected={filterType === filter.key}
				>{capitalize(singular(String(filterType)))}</option>
		{/each}
	</select>
	<input
		use:autofocus={bAutofocus}
		bind:this={input}
		bind:value={filter.value}
		onfocus={(e) => e.currentTarget.select()}
		placeholder={capitalize(singular(String(filter.key)))}
		class="input input-sm join-item"
		required={true} />
	<button type="submit" class="btn btn-sm btn-primary join-item">Confirm</button>
</form>
