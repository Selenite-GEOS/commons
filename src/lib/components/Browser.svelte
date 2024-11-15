<script lang="ts" generics="T">
	import type { ArrayKeys, StringArrayKeys, StringKeys } from '$lib/type';
	import { onMount, type Snippet } from 'svelte';
	import { flip } from 'svelte/animate';

	import FolderComponent from './Folder.svelte';
	import { horizontalScroll } from '$lib/actions';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Filters } from './filter';
	import SearchBar from './SearchBar.svelte';
	import {
		filterItems,
		getQueriedItems,
		localId,
		type Filter,
		type FilterDefinition
	} from '$lib/utils';
	import DefaultItem from './browser/DefaultItem.svelte';
	import { fade } from 'svelte/transition';
	import { modals } from './modal';
	import { range } from 'lodash-es';

	interface Props extends HTMLAttributes<HTMLElement> {
		items?: T[];
		pathKey?: ArrayKeys<T>;
		current?: string[];
		Item?: Snippet<[Partial<T>]>;
		Folder?: Snippet<[T]>;
		solid?: boolean;
		cols?: number;
		itemWidth?: number;
		itemProps?: HTMLAttributes<HTMLElement>;
		itemDblClick?: (item: T, e: Event) => void;
		itemDragStart?: (item: T, e: DragEvent) => void;
		itemAfterUpdate?: (item: T) => void;
		itemDelete?: (item: T, e: Event) => void;
		query?: string;
		queriedKeys?: Iterable<StringKeys<T> | StringArrayKeys<T>>;
		searchBar?: boolean;
		displayPath?: boolean;
		flipDuration?: number;
		header?: string | Snippet;
		knownTags?: string[];
		filterDefs?: FilterDefinition<T>[];
		filters?: Filter<T>[];
	}

	let {
		query = $bindable(''),
		queriedKeys = ['name', 'label', 'path', 'tags', 'author'] as Iterable<
			StringKeys<T> | StringArrayKeys<T>
		>,
		searchBar = true,
		displayPath: pathDisplay = true,
		items = $bindable([]),
		current = $bindable<string[]>([]),
		pathKey = 'path' as ArrayKeys<T>,
		solid = false,
		cols = 4,
		itemWidth,
		flipDuration = 200,
		Item,
		itemProps = {},
		itemDblClick,
		itemDragStart,
		itemAfterUpdate,
		itemDelete,
		header = 'Browser',
		filters = $bindable([]),
		filterDefs = [],
		knownTags = [],
		...props
	}: Props = $props();

	const duration = $derived(flipDuration);
	type Path = string;
	const filteredItems = $derived(filterItems({ items, filters }));
	const queriedItems = $derived(getQueriedItems({ items: filteredItems, query, queriedKeys }));
	const pathsData = $derived.by(() => {
		console.debug('Computing paths data');
		const res = new Map<Path, { items: T[]; folders: Set<string> }>();
		for (const item of queriedItems) {
			const path = (item[pathKey] as string[]) ?? [];
			const strPath = path.join('/');
			if (!res.has(strPath)) res.set(strPath, { items: [], folders: new Set() });
			res.get(strPath)!.items.push(item);

			for (const i of range(-1, path.length)) {
				const parentPath = path.slice(0, i);
				const strParentPath = parentPath.join('/');
				if (!res.has(strParentPath)) res.set(strParentPath, { items: [], folders: new Set() });
				const folder = path.at(i)!;
				if (!folder) continue;
				res.get(strParentPath)?.folders.add(folder);
			}
		}
		return res;
	});

	const currentStr = $derived(current.join('/'));

	function goBack() {
		current.pop();
	}
	const folders = $derived(Array.from(pathsData.get(currentStr)?.folders ?? []).sort());
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

	const itemAndId = $derived.by(() => {
		const itemToId = new Map<T, string>();
		const idToItem = new Map<string, T>();

		for (const item of items) {
			const id = localId('browser-item');
			itemToId.set(item, id);
			idToItem.set(id, item);
		}
		return { itemToId, idToItem };
	});

	const itemToId = $derived(itemAndId.itemToId);
	const idToItem = $derived(itemAndId.idToItem);

	let newFolder = $state(false);

	function getDraggedItem(e: DragEvent): T | undefined {
		const data = e.dataTransfer?.getData('text/plain');
		if (!data) return;
		try {
			const item = JSON.parse(data) as { __draggedId__?: string };
			const id = item.__draggedId__;
			if (!id) return;
			return idToItem.get(id);
		} catch (e) {
			console.error('Failed to parse dragged item', e);
			return;
		}
	}
	function handleDragOnFoldercontainers(e: DragEvent) {
		newFolder = e.target === foldercontainer;
		if (newFolder) e.preventDefault();
	}
	function handleDropOnFolderContainer(e: DragEvent) {
		if (e.target !== foldercontainer) return;
		newFolder = false;
		const item = getDraggedItem(e) as { path?: string[] } | undefined;
		if (!item) return;
		modals.show({
			title: 'Create new folder ?',
			prompt: 'Folder',
			response(r) {
				if (!r || typeof r !== 'string') return;
				const newPath = [...(item.path ?? []), r];
				item.path = newPath;
				itemAfterUpdate?.(item as T);
			}
		});
	}
	let foldercontainer = $state<HTMLElement>();
</script>

<section
	{...props}
	class="grid grid-rows-[0fr,4.6rem,1fr] h-full w-full justify-stretch place-content-start {props.class}">
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
		{#if pathDisplay}
			<div
				use:horizontalScroll
				class="breadcrumbs text-sm rounded-box bg-base-200 px-2 border border-base-content border-opacity-15 mb-4 w-full">
				<ul>
					{#snippet link(label: string, i: number)}
						{@const classes = ['outline', 'outline-1', 'outline-accent', 'rounded-box']}
						<li>
							<button
								ondragover={(e) => {
									e.preventDefault();
									if (!(e.target instanceof HTMLElement)) return;
									e.target.classList.add(...classes);
								}}
								ondragleave={(e) => {
									if (e.target instanceof HTMLElement) {
										e.target.classList.remove(...classes);
									}
								}}
								ondrop={(e) => {
									if (e.target instanceof HTMLElement) {
										e.target.classList.remove(...classes);
									}
									const item = getDraggedItem(e);
									if (!item) return;
									(item[pathKey] as string[]) = current.slice(0, i + 1);
									itemAfterUpdate?.(item);
								}}
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
		{/if}
		<!-- Filters -->
		{#if filterDefs.length > 0 || useTags}
			<Filters bind:filters {filterDefs} {flipDuration} />
		{/if}
	</div>
	<!-- Folders -->
	<ul
		use:horizontalScroll
		style="scrollbar-width: thin;"
		class="flex mb-4 row-start-2 overflow-x-auto relative overflow-y-visible w-full rounded-box transition-all {newFolder
			? 'outline outline-1 outline-accent'
			: ''}"
		bind:this={foldercontainer}
		ondragenter={handleDragOnFoldercontainers}
		ondrop={handleDropOnFolderContainer}
		ondragover={handleDragOnFoldercontainers}
		ondragleave={() => (newFolder = false)}>
		{#if currentStr}
			<FolderComponent
				ondrop={(e) => {
					const item = getDraggedItem(e);
					if (!item) return;
					(item[pathKey] as string[]) = current.slice(0, -1);
					itemAfterUpdate?.(item);
				}}
				folder={'..'}
				{solid}
				onclick={goBack} />
		{/if}
		{#each folders as folder (folder)}
			<li animate:flip={{ duration: flipDuration }} class="w-fit">
				<FolderComponent
					ondrop={(e) => {
						const item = getDraggedItem(e);
						if (!item) return;
						(item[pathKey] as string[]) = [...current, folder];
						itemAfterUpdate?.(item);
					}}
					{query}
					{folder}
					{solid}
					onclick={() => current.push(folder)} />
			</li>
		{/each}

		{#if newFolder}
			<div transition:fade={{ duration }} class="pointer-events-none opacity-50">
				<FolderComponent folder={'New Folder'} />
			</div>
		{:else if folders.length === 0 && current.length === 0}
			<span class="text-sm italic p-2 pointer-events-none absolute">No folders yet.</span>
		{/if}
	</ul>
	<div class="relative" style="min-width: 100%; {widthStyle}">
		<div class="opacity-0 absolute" bind:clientWidth={itemWidth}>
			{#if !Item}
				<DefaultItem />
			{:else}
				{@render Item({})}
			{/if}
		</div>
		<div class="absolute inset-0 overflow-y-auto overflow-x-clip" style="scrollbar-width: thin;">
			<ul
				class="mx-auto flex flex-wrap place-content-start gap-2"
				style="width: calc({cols * (itemWidth ?? 98)}px + {0.5 * (cols - 1)}rem);">
				{#each pathsData.get(currentStr)?.items ?? [] as item (item)}
					<li animate:flip={{ duration: flipDuration }}>
						{#if !Item}
							<DefaultItem
								{item}
								{filters}
								{query}
								{itemToId}
								{...itemProps}
								{itemDragStart}
								{itemDblClick}
								{itemDelete} />
						{:else}
							{@render Item(item)}
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
