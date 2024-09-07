<script lang="ts" generics="T">
	import type { ArrayKeys } from '$lib/type';
	import type { Snippet } from 'svelte';
	import { flip } from 'svelte/animate';

	import FolderComponent from './Folder.svelte';
	import { horizontalScroll } from '$lib/actions';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		items?: T[];
		pathKey?: ArrayKeys<T>;
		Item?: Snippet<[T]>;
		Folder?: Snippet<[T]>;
		solid?: boolean;
        cols?: number;
        query?: string;
	}

	let { query = '', items = [], pathKey = 'path' as ArrayKeys<T>, solid = false, cols = 4, Item, ...props }: Props = $props();

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
</script>

<section {...props} class="grid justify-center {props.class}">
    <h1 class="font-bold text-xl px-2 text-nowrap truncate min-h-8" title="Number of macroblocks : 2">Macro Blocks</h1>
	<div
        use:horizontalScroll
		class="breadcrumbs text-sm rounded-box bg-base-200 px-2 border border-base-content border-opacity-15 mb-4 w-full" >
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

	<div class="grid items-center gap-2" style="grid-template-columns: repeat({cols}, minmax(0, 1fr));">
		<ul class="grid grid-cols-subgrid mb-2" style="grid-column: span {cols} / span {cols};">
			{#if currentStr}
				<FolderComponent {query} folder={'..'} {solid} onclick={goBack} />
			{/if}
			{#each pathsData.get(currentStr)?.folders ?? [] as folder (folder)}
				<li animate:flip>
					<FolderComponent {query} {folder} {solid} onclick={() => current.push(folder)} />
				</li>
			{/each}
		</ul>
		<ul class="grid grid-cols-subgrid" style="grid-column: span {cols} / span {cols};">
			{#each pathsData.get(currentStr)?.items ?? [] as item (item)}
				<li animate:flip class="m-auto">
					{#if !Item}
						Missing Item snippet.
					{:else}
						{@render Item(item)}
					{/if}
				</li>
			{/each}
		</ul>
		<!-- {#each currentEntries as entry (entry)}
		<li animate:flip={{ duration: 200 }} class="w-fit m-auto">
			{#if 'folder' in entry}
				<FolderComponent folder={entry.folder} onclick={() => current.push(entry.folder)} {solid} />
			{:else if !Item}
				Missing Item snippet.
			{:else}
				{@render Item(entry.item)}
			{/if}
		</li>
	{/each} -->
	</div>
</section>
