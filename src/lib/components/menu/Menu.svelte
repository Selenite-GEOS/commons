<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { flattenTree, makeTree, TreeComponent } from '../tree';
	import type { MenuItem } from './types';

	type Props = {
		items: MenuItem[];
		onclick?: () => void;
		class?: string;
		sort?: boolean;
	};
	let { items, onclick, class: classes = '', sort = true }: Props = $props();

	let focusedIndex = $state(-1);
	const tree = $derived.by(() => {
		untrack(() => {
			focusedIndex = -1;
		});
		return makeTree({
			items,
			pathKey: 'path',
			sort: sort
				? (a, b) => {
						return a.label.localeCompare(b.label);
					}
				: undefined
		});
	});

	const itemsInTree = $derived(flattenTree(tree));
	let focusedItem: MenuItem | undefined = $derived(itemsInTree[focusedIndex]);
	$inspect('items', items);
	$inspect('tree', tree);
	export function getFocusedItem(): MenuItem | undefined {
		return focusedItem;
	}
	let treeCmpnt = $state<TreeComponent<MenuItem>>();
	let treeElement = $state<HTMLElement>();
	export function expandAll() {
		treeCmpnt?.expandAll();
	}
	export function collapseAll() {
		treeCmpnt?.collapseAll();
	}
	export function focusNext() {
		if (itemsInTree.length === 0) return;
		focusedIndex = (focusedIndex + 1) % itemsInTree.length;
		focusFocusedItem();
	}

	export function focusPrevious() {
		if (itemsInTree.length === 0) return;
		if (focusedIndex === -1) focusedIndex = itemsInTree.length - 1;
		else focusedIndex = (itemsInTree.length + focusedIndex - 1) % itemsInTree.length;
		focusFocusedItem();
	}

	async function focusFocusedItem() {
		if (!focusedItem) return;
		console.debug('Focus', { ...focusedItem });
		treeCmpnt?.expandPath(focusedItem.path);
		await tick();
		const elmnt = treeElement?.querySelector(`#${focusedItem.id}`) as
			| (HTMLElement & {
					focus?: () => void;
			  })
			| undefined;
		if (elmnt?.focus) elmnt.focus();
	}

	export function triggerFirst() {
		console.log('trigger first');
		itemsInTree.at(0)?.action();
	}
</script>

<div class="p-2 bg-neutral text-neutral-content {classes}">
	<TreeComponent bind:this={treeCmpnt} bind:element={treeElement} {tree}>
		{#snippet leaf(item: MenuItem)}
			<!-- svelte-ignore event_directive_deprecated -->
			<button
				type="button"
				id={item.id}
				class="transition-all cursor-pointer truncate duration-100 p-0.5 px-4 rounded-field w-full text-start bg-transparent hover:bg-base-300 hover:text-base-content"
				title={item.description.trim().length > 0 ? item.description : item.label}
				on:click={() => {
					if (onclick) onclick();
					item.action();
				}}>{item.label}</button>
		{/snippet}
	</TreeComponent>
</div>
