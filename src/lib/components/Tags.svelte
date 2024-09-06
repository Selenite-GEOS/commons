<script lang="ts">
	import { autofocus, keys } from '$lib/actions';
	import { sleep } from '$lib/utils';
	import { createFloatingActions } from 'svelte-floating-ui';
	import { flip } from 'svelte/animate';
	import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import MatchHighlighter from './MatchHighlighter.svelte';
	import { slide } from 'svelte/transition';

	interface Props extends HTMLAttributes<HTMLUListElement> {
		tags?: string[];
		knownTags?: string[];
		popupBg?: string;
		tagProps?: HTMLButtonAttributes;
		tagBadge?: string;
		addTagProps?: HTMLButtonAttributes;
	}

	let {
		tags = $bindable([]),
		knownTags = [],
		popupBg = 'bg-base-200',
		tagBadge = 'badge-secondary',
		tagProps = {},
		addTagProps = {},
		...props
	}: Props = $props();

	const tagsSet = $derived(new Set(tags));
	let creatingTag = $state(false);
	let newTag = $state('');
	const trimmedNewTag = $derived(newTag.trim());
	function addNewTag() {
		if (!trimmedNewTag) return;
		if (!tags.includes(trimmedNewTag)) tags.push(trimmedNewTag);
		newTag = '';
	}

	function addTag(tag: string) {
		const trimmedTag = tag.trim();
		if (!trimmedTag || tags.includes(trimmedTag)) return;
		tags.push(trimmedTag);
	}
	const loweredKnownTags = $derived(knownTags.map((t) => t.toLowerCase()));
	const loweredNewTag = $derived(newTag);
	const filteredKnownTags = $derived(
		loweredKnownTags.filter((t) => t.includes(loweredNewTag) && !tagsSet.has(t))
	);

	const [knowTagsRef, knowTagsPopup] = createFloatingActions({});
</script>

{#snippet Tag(label: string, props: HTMLButtonAttributes = {})}
	<button type="button" {...props} class="badge my-2 {props.class}">
		{label}
	</button>
{/snippet}

<!-- Known tags popup -->
{#if filteredKnownTags.length > 0 && creatingTag}
	<div in:slide class="z-10" use:knowTagsPopup>
		<ul
			class="{popupBg} p-2 rounded-box gap-2 flex flex-wrap max-w-[20rem] max-h-[10rem] justify-center overflow-y-auto overflow-x-clip">
			{#each filteredKnownTags as tag (tag)}
				<li>
					<button type="button" class="btn btn-neutral btn-sm tags-btn" onclick={() => addTag(tag)}>
						<MatchHighlighter content={tag} ref={newTag} />
					</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<ul {...props} class="flex flex-wrap gap-2 items-center {props.class}">
	{#each tags as tag, i (tag)}
		<li animate:flip={{ duration: 200 }}>
			{@render Tag(tag, {
				...tagProps,
				class: `hover:badge-error ${tagBadge} ${tagProps.class}`,
				onclick: (e) => {
					tagProps.onclick?.(e);
					tags.splice(i, 1);
				}
			})}
		</li>
	{/each}
	{#if creatingTag}
		<input
			class="input input-bordered input-sm"
			placeholder="New tag"
			use:knowTagsRef
			use:autofocus
			bind:value={newTag}
			onblur={async (e) => {
				if (
					e.relatedTarget instanceof HTMLElement &&
					(e.relatedTarget.classList.contains('badge') ||
						e.relatedTarget.classList.contains('tags-btn'))
				) {
					await sleep();
					if (e.target instanceof HTMLInputElement) e.target?.focus();
					return;
				}
				creatingTag = false;
			}}
			use:keys={{
				enter: (e) => {
					e.preventDefault();
					if (!e.target.value) {
						addTag(filteredKnownTags[0]);
						return;
					}
					addNewTag();
				},
				escape: () => (creatingTag = false),
				backspace: (e) => {
					const v = e.target.value;
					if (v) return;
					e.preventDefault();
					newTag = tags.pop() ?? '';
				}
			}} />
	{/if}
	<li>
		{@render Tag('+ Add tag', {
			...addTagProps,
			class: `hover:badge-accent ${addTagProps.class}`,
			onclick: (e) => {
				if (creatingTag) {
					addNewTag();
				}
				creatingTag = true;
				addTagProps.onclick?.(e);
			}
		})}
	</li>
</ul>
