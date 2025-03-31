<script lang="ts">
	import { createFloatingActions } from 'svelte-floating-ui';
	import { flip, offset } from 'svelte-floating-ui/dom';
	import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { autofocus, horizontalScroll, keyboardNavigation, keys, sleep } from '$lib';
	import { tick } from 'svelte';
	import type { Action } from 'svelte/action';
	import MatchHighlighter from './MatchHighlighter.svelte';
	import { indexOf, uniq } from 'lodash-es';

	interface Props extends HTMLAttributes<HTMLElement> {
		path?: string[];
		paths?: string[][];
	}

	let { path = $bindable([]), paths = [], ...props }: Props = $props();
	const [addPopupRef, addPopup] = createFloatingActions({
		placement: 'bottom',
		middleware: [offset(10), flip()]
	});

	let createdPart = $state('');
	const trimmedCreatedPart = $derived(createdPart.trim());
	const loweredCreatedPart = $derived(createdPart.toLowerCase());
	const stringedPath = $derived(path.join('/'));
	const pathsPrefixes = $derived(paths.map((p) => p.slice(0, path.length).join('/')));
	const allOptionsForCreatedPart = $derived(
		uniq(
			pathsPrefixes
				.map((p, i) => (p === stringedPath ? paths[i][path.length] : undefined))
				.filter(Boolean) as string[]
		)
	);
	const optionsForCreatedPart = $derived(
		allOptionsForCreatedPart.filter((s) => s?.toLowerCase().includes(loweredCreatedPart))
	);

	let focusedOption = $state('');
	let focusedOptionIndex = $derived.by(() => {
		const i = indexOf(optionsForCreatedPart, focusedOption);
		if (i === -1) return 0;
		return i;
	});

	// let showAddPopup = $state(true);
	let creatingPart = $state(false);

	function addCreatedPart(b?: boolean) {
		if (trimmedCreatedPart.length > 0) path.push(trimmedCreatedPart);
		else if (focusedOption) path.push(focusedOption);
		else if (b && optionsForCreatedPart[0]) path.push(optionsForCreatedPart[0]);
		createdPart = '';
		focusedOption = '';
	}
	function discardCreatedPart() {
		createdPart = '';
		creatingPart = false;
	}
	let blurDiscards = true;
	const debug = false;
	let creationInput = $state<HTMLInputElement>();
</script>

{#if creatingPart || debug}
	<div use:addPopup class="bg-base-300 p-4 rounded-box">
		{#if optionsForCreatedPart.length === 0}
			<span class="italic">No folders here. A new one will be created.</span>
		{:else}
			<ul>
				{#each optionsForCreatedPart as part (part)}
					{@const isFocused = part === focusedOption}
					<li>
						<button
							type="button"
							class="btn btn-ghost gap-0 {!isFocused ? '' : 'outline outline-accent outline-1'}"
							class:outline-accent={isFocused}
							class:outline-[0.5]={isFocused}
							use:keyboardNavigation
							onpointerdown={async () => {
								path.push(part);
								blurDiscards = false;
								await tick();
								await sleep();
								blurDiscards = true;
								creationInput?.focus();
							}}>
							<MatchHighlighter content={part} ref={createdPart} />
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<div
	{...props}
	class="breadcrumbs py-0 {props.class} pe-1"
	use:horizontalScroll
	style="scrollbar-gutter: stable;">
	<ul class="flex items-center !min-h-14">
		{#snippet Button(label: string, props: HTMLButtonAttributes & { action?: Action } = {})}
			{#if props.action}
				<button type="button" {...props} class="hover:link p-1 {props.class}" use:props.action>
					{label}
				</button>
			{:else}
				<button type="button" {...props} class="hover:link p-1 {props.class}">
					{label}
				</button>
			{/if}
		{/snippet}
		{#snippet pathButton(
			label: string,
			i: number,
			props: HTMLButtonAttributes & { action?: Action } = {}
		)}
			<li>
				{@render Button(label, {
					...props,
					onpointerdown:
						props.onclick ??
						(async () => {
							await sleep();
							focusedOption = path[i] ?? '';
							path = path.slice(0, i);
							creatingPart = true;
						})
				})}
			</li>
		{/snippet}

		{@render pathButton('/', 0, {
			onclick: () => {
				path.splice(0);
				focusedOption = '';
			}
		})}

		{#each path as part, i (i)}
			{@render pathButton(part, i)}
		{/each}

		{#if creatingPart || debug}
			<li>
				<input
					use:addPopupRef
					use:autofocus
					bind:value={createdPart}
					bind:this={creationInput}
					class="input input-bordered"
					oninput={() => {
						focusedOption = '';
					}}
					placeholder={(focusedOptionIndex === -1
						? undefined
						: optionsForCreatedPart[focusedOptionIndex]) ?? 'New folder'}
					onblur={(e) => {
						if (
							e.relatedTarget instanceof HTMLButtonElement &&
							e.relatedTarget.classList.contains('pathAddBtn')
						) {
							return;
						}
						if (blurDiscards) addCreatedPart();
						if (blurDiscards) discardCreatedPart();
					}}
					use:keys={{
						backspace: (e) => {
							if (createdPart.length > 0 || path.length === 0) return;
							e.preventDefault();
							const tmp = path.pop()!;
							if (optionsForCreatedPart.includes(tmp)) {
								focusedOption = tmp;
							} else {
								createdPart = tmp;
							}
						}
					}}
					onkeydown={(e) => {
						if (e.key !== '/') return;
						e.preventDefault();
						addCreatedPart(true);
					}}
					use:keys={{
						preventDefault: true,
						enter: async (e) => {
							addCreatedPart(true);
							await tick();
							await sleep();
							e.target
								.closest('.breadcrumbs')
								?.querySelector('.pathAddBtn')
								?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
						},
						escape: discardCreatedPart,
						down: () => {
							const i = (focusedOptionIndex + 1) % optionsForCreatedPart.length;
							focusedOption = optionsForCreatedPart[i];
						},
						up: () => {
							const i =
								(focusedOptionIndex - 1 + optionsForCreatedPart.length) %
								optionsForCreatedPart.length;
							focusedOption = optionsForCreatedPart[i];
						}
					}} />
			</li>
		{/if}
		<li class:opacity-0={creatingPart && trimmedCreatedPart.length === 0}>
			{@render Button('+', {
				class: `pathAddBtn`,
				onclick: async (e) => {
					if (creatingPart && trimmedCreatedPart) {
						path.push(trimmedCreatedPart);
						createdPart = '';
						await sleep();
						creationInput?.focus();
					}
					blurDiscards = false;
					creatingPart = true;
					await tick();
					await sleep();
					blurDiscards = true;
					await tick();
					await sleep();
					// Scroll button into view
					(e.target as HTMLButtonElement)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				}
			})}
		</li>
	</ul>
</div>
