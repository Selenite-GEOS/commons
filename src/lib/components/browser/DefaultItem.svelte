<script lang="ts" generics="T">
	import { fade } from 'svelte/transition';
	import MatchHighlighter from '../MatchHighlighter.svelte';
	import { getActiveFilters, type Filter } from '$lib/utils/filter';
	import { horizontalScroll, scrollIntoView } from '$lib/actions';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		item?: unknown;
		query?: string;
		filters?: Iterable<Filter<T>>;
        itemToId?: Map<T, string>;
	}

	let { item = {}, query = '', filters, itemToId, ...props }: Props = $props();
	interface DefaultItem {
		label?: string;
		name?: string;
		title?: string;
		tags?: string[];
        descr?: string;
        description?: string;
	}
	const o: DefaultItem = $derived(typeof item === 'object' && item ? item : {});
	const label = $derived(o.title ?? o.name ?? o.label ?? (typeof item === 'string' ? item : 'Item'));

	const activeFilters = $derived(getActiveFilters(filters));
	const activeTags = $derived(activeFilters.get('tags' as keyof T) ?? new Set());

    function ondragstart(e: DragEvent) {
        const preppedItem = $state.snapshot(o);
        (preppedItem as {__draggedId__?: string}).__draggedId__ = itemToId?.get(o as T);
        e.dataTransfer?.setData('text/plain', JSON.stringify(preppedItem, null, 2));
    }
</script>

<article
	title={o.description ?? o.descr}
	draggable="true"
	{...props}
    ondragstart={(e) => {
		props.ondragstart?.(e);
		ondragstart(e);
	}}
	class="transition-all flex flex-col items-center cursor-pointer bg-base-300 rounded-box p-4 border border-base-content border-opacity-15 overflow-clip {props.class}"
	in:fade
	out:fade={{ duration: 50 }}

	>
	<div class="text-nowrap truncate h-24 w-32 flex flex-col">
		<span class="text-nowrap font-semibold mx-auto"
			><MatchHighlighter content={label} ref={query} /></span>
		<div class="grow"></div>
		<ul
			class="flex gap-2 justify-self-end overflow-x-auto overflow-y-clip"
			use:horizontalScroll
			style="scrollbar-width: thin;">
			{#each o.tags ?? [] as tag (tag)}
				<li use:scrollIntoView={activeTags.has(tag)}  class="badge {activeTags.has(tag) ? 'badge-accent' : 'badge-neutral'}">
					<MatchHighlighter content={tag} ref={query} />
				</li>
			{/each}
		</ul>
	</div>
</article>
