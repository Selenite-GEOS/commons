<script lang="ts" generics="T">
	import type { ArrayKeys } from '$lib/type';
	import { onMount, type Snippet } from 'svelte';
	import { flip } from 'svelte/animate';

	import FolderComponent from './Folder.svelte';
	import { horizontalScroll } from '$lib/actions';
	import type { HTMLAttributes } from 'svelte/elements';
	import Fa from 'svelte-fa';
	import { faSearch } from '@fortawesome/free-solid-svg-icons';
	import { Filters, type Filter, type FilterDefinition } from './filter';
	import SearchBar from './SearchBar.svelte';

	interface Props extends HTMLAttributes<HTMLElement> {
		items?: T[];
		pathKey?: ArrayKeys<T>;
		Item?: Snippet<[Partial<T>]>;
		Folder?: Snippet<[T]>;
		solid?: boolean;
		cols?: number;
		itemWidth?: number;
		query?: string;
		searchBar?: boolean;
		flipDuration?: number;
		header?: string | Snippet;
		knownTags?: string[];
		filterDefs?: FilterDefinition<T>[];
		filters?: Filter<T>[];
	}

	let {
		query = $bindable(''),
		searchBar = true,
		items = [],
		pathKey = 'path' as ArrayKeys<T>,
		solid = false,
		cols = 4,
		itemWidth,
		flipDuration = 200,
		Item,
		header = 'Browser',
		filters = $bindable([]),
		filterDefs = [],
		knownTags = [],
		...props
	}: Props = $props();

	type Path = string;
	const pathsData = $derived.by(() => {
		const res = new Map<Path, { items: T[]; folders: Set<string> }>();

		for (const item of items) {
			const path = (item[pathKey] as string[]) ?? [];
			const strPath = path.join('/');
			if (!res.has(strPath)) res.set(strPath, { items: [], folders: new Set() });
			res.get(strPath)!.items.push(item);
			if (!(path.length > 0)) continue;
			const parentPath = path.slice(0, -1);
			const strParentPath = parentPath.join('/');
			if (!res.has(strParentPath)) res.set(strParentPath, { items: [], folders: new Set() });
			const folder = path.at(-1)!;
			res.get(strParentPath)?.folders.add(folder);
		}

		return res;
	});

	let current: string[] = $state([]);
	const currentStr = $derived(current.join('/'));

	const currentEntries = $derived.by(() => {
		const res: ({ folder: string } | { item: T })[] = [];
		const entries = pathsData.get(currentStr);
		if (!entries) return res;

		for (const folder of entries.folders) res.push({ folder });
		for (const item of entries.items) res.push({ item });

		return res;
	});

	function goBack() {
		current.pop();
	}
	const folders = $derived(Array.from(pathsData.get(currentStr)?.folders ?? []).sort());
	const loweredQuery = $derived(query.toLowerCase());
	const useTags = $derived(knownTags.length > 0);
	let scrollbarWidth = $state(10);
	onMount(() => {
		// Create the div
		var scrollDiv = document.createElement('div');
		scrollDiv.className = 'overflow-y-scroll overflow-x-clip';
		scrollDiv.style.scrollbarWidth = 'thin';
		document.body.appendChild(scrollDiv);

		// Get the scrollbar width
		scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

		// Delete the div
		document.body.removeChild(scrollDiv);
	});

	const widthStyle = $derived(
		`width: calc(${cols * (itemWidth ?? 98) + scrollbarWidth}px + ${0.5 * (cols - 1)}rem);`
	);
</script>

<section
	{...props}
	class="grid grid-rows-[0fr,0fr,1fr] grid-cols-1 h-full w-full justify-stretch place-content-start {props.class}">
	<div class="grid">
		{#if typeof header === 'function'}
			{@render header()}
		{:else}
			<h1 class="font-bold text-xl px-2 text-nowrap truncate min-h-8 mb-1">{header}</h1>
		{/if}
		{#if searchBar}
			<SearchBar bind:query />
		{/if}

		<!-- Path display -->
		<div
			use:horizontalScroll
			class="breadcrumbs text-sm rounded-box bg-base-200 px-2 border border-base-content border-opacity-15 mb-4 w-full">
			<ul>
				{#snippet link(label: string, i: number)}
					<li>
						<button
							type="button"
							class="link-hover cursor-pointer p-1 px-2"
							onclick={() => (current = current.slice(0, i + 1))}>{label}</button>
					</li>
				{/snippet}
				{@render link('/', -1)}
				{#each current as p, i}
					{@render link(p, i)}
				{/each}
			</ul>
		</div>

		<!-- Filters -->
		{#if filterDefs.length > 0 || useTags}
			<Filters bind:filters {filterDefs} {flipDuration} />
		{/if}
	</div>
	<ul class="flex flex-wrap gap-2 mb-4 row-start-2">
		{#if currentStr}
			<FolderComponent folder={'..'} {solid} onclick={goBack} />
		{/if}
		{#each folders as folder (folder)}
			<li animate:flip={{ duration: flipDuration }} class="w-fit">
				<FolderComponent {query} {folder} {solid} onclick={() => current.push(folder)} />
			</li>
		{/each}
	</ul>
	<div class="relative" style="min-width: 100%; {widthStyle}">
		{#if Item}
			<div class="opacity-0 absolute" bind:clientWidth={itemWidth}>
				{@render Item({})}
			</div>
		{/if}
		<div class="absolute inset-0 overflow-y-auto overflow-x-clip" style="scrollbar-width: thin;">
			<ul
				class="mx-auto flex flex-wrap place-content-start gap-2"
				style="width: calc({cols * (itemWidth ?? 98)}px + {0.5 * (cols - 1)}rem);">
				{#each pathsData.get(currentStr)?.items ?? [] as item (item)}
					<li animate:flip={{ duration: flipDuration }}>
						{#if !Item}
							Missing Item snippet.
						{:else}
							{@render Item(item)}
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
