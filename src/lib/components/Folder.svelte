<script lang="ts">
	import { faFolder, faFolderOpen } from '@fortawesome/free-regular-svg-icons';
	import {
		faFolderOpen as faFolderOpenSolid,
		faFolder as faFolderSolid
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';
	import MatchHighlighter from './MatchHighlighter.svelte';

	interface Props
		extends Omit<
			HTMLButtonAttributes,
			'onfocusin' | 'onfocusout' | 'onpointerover' | 'onpointerleave'
		> {
		folder?: string;
		solid?: boolean;
        query?: string;
	}

	let { query = '', folder = '', solid = false, ...props }: Props = $props();

	let focused = $state(false);
	let hovered = $state(false);
	let interval;
	$effect(() => {
		// interval = setInterval(() => {
		// 	focused = !focused;
		// }, 500);

		return () => clearInterval(interval);
	});

	const duration = 200;
	// 	ondragenter={(e) => e.preventDefault()}
	// ondragover={(e) => e.preventDefault()}
</script>

<button
	type="button"
	class="p-1"
	{...props}
	ondragover={(e) => {
		hovered = true;
		e.preventDefault()
	}}
	ondragleave={(e) => {
		hovered = false;
		e.preventDefault()
	}}
	onfocusin={() => (focused = true)}
	onfocusout={() => (focused = false)}
	onpointerover={() => (hovered = true)}
	onpointerleave={() => (hovered = false)}>
	<article class="flex flex-col items-center w-16">
		<div class="size-6 relative mb-1 pointer-events-none">
			{#if focused || hovered}
				<div class="absolute" transition:fade={{ duration }}>
					<Fa icon={solid ? faFolderOpenSolid : faFolderOpen} class="text-2xl" />
				</div>
			{:else}
				<div class="absolute" transition:fade={{ duration }}>
					<Fa icon={solid ? faFolderSolid : faFolder} class="text-2xl" />
				</div>
			{/if}
		</div>
		<h1 class="text-sm truncate max-w-16" title={folder}>
			<MatchHighlighter content={folder} ref={query}/>
		</h1>
	</article>
</button>
