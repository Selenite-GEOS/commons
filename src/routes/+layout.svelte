<script lang="ts">
	
	import '../app.css';
	import { capitalizeWords, contextMenu, posFromClient, preventDefault, SeleniteLogo, showContextMenu, ThemeController } from '$lib';
	import ModalComponent from '$lib/components/modal/ModalComponent.svelte';
	import ContextMenu from '$lib/components/menu/ContextMenu.svelte';
	import { page } from '$app/state';
	let { children } = $props();
	const title = $derived(capitalizeWords(page.route.id?.slice(1).split('-').join(' ') ?? ''));
</script>

<svelte:head>
	<title>{title ? title : 'Selenite Commons'}</title>
</svelte:head>
<a href="/">
	<SeleniteLogo class="absolute m-2" />
</a>
<ModalComponent />
<ContextMenu />
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<main class="p-4 relative min-h-screen w-screen grid justify-center gap-2 items-start place-content-start" onclick={() => {
	if (contextMenu.visible) {
		contextMenu.visible = false;
	}
}} oncontextmenu={(e) => {
	preventDefault(e);
	showContextMenu({items: [{label: "A"}, {label: "Ba", path: ["B"]}, {label: "b-b", path: ["B"]}], pos: posFromClient(e), autoHide: false, searchbar: true});
}}>
	<div class="absolute right-2 top-2">
		<ThemeController />
	</div>

	{#if title}
		<a class="m-auto mb-2" href="/"><btn class="btn w-fit btn-sm">Main Page</btn></a>
		<h1 class="text-2xl font-bold m-auto mb-4">{title}</h1>
	{/if}
	{@render children()}
</main>
