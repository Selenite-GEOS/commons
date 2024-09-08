<script lang="ts" generics="T">
	import { createFloatingActions } from 'svelte-floating-ui';
	import { offset, shift } from 'svelte-floating-ui/core';
	import FilterCreator from './FilterCreator.svelte';
	import type { Filter, FilterDefinition } from './types';
	import FilterDisplay from './FilterDisplay.svelte';
	import { flip } from 'svelte/animate';

	interface Props {
		filters?: Filter<T>[];
		filterDefs?: FilterDefinition<T>[];
		flipDuration?: number;
	}

	let { filters = $bindable([]), filterDefs = [], flipDuration = 200 }: Props = $props();

	const [addFilterRef, addFilterPopup] = createFloatingActions({
		placement: 'bottom-start',
		middleware: [offset(5), shift()]
	});
	let showAddFilterPopup = $state(false);
	let filtersContainer = $state<HTMLElement>();
</script>

<div
	bind:this={filtersContainer}
	onfocusout={(e) => {
		if (!filtersContainer) return;
		if (e.relatedTarget instanceof HTMLElement && filtersContainer.contains(e.relatedTarget))
			return;
		showAddFilterPopup = false;
	}}>
	{#if showAddFilterPopup}
		<div tabindex="-1" use:addFilterPopup class="z-10">
			<FilterCreator bind:filters {filterDefs} />
		</div>
	{/if}
	<ul class="flex flex-wrap gap-2 items-center mb-6">
		{#each filters as filter, i (filter)}
			<li animate:flip={{ duration: flipDuration }}>
				<FilterDisplay
					{filter}
					onclick={() => (filter.active = !filter.active)}
					oncontextmenu={(e) => {
						e.preventDefault();
						filters.splice(i, 1);
					}} />
			</li>
		{/each}
		{#if filterDefs.length > 0}
			<button
				type="button"
				onclick={() => (showAddFilterPopup = !showAddFilterPopup)}
				use:addFilterRef
				class="text-sm badge border-opacity-0 {showAddFilterPopup
					? 'dbadge-neutral'
					: 'hover:border-opacity-100 hover:badge-accent'}">+ Add filter</button>
		{/if}
	</ul>
</div>
