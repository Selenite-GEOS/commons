<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import { capitalizeWords, SeleniteLogo } from '$lib';
	let {children} = $props();
	const title = $derived(capitalizeWords($page.route.id?.slice(1).split('-').join(' ') ?? ''));
</script>

<SeleniteLogo class="absolute m-2"/>
<main class="p-4 min-h-screen grid justify-center gap-2 items-start place-content-start">
	{#if title}
	<a class="m-auto mb-2" href="/"><btn class="btn w-fit btn-sm">Main Page</btn></a>
	<h1 class="text-2xl font-bold m-auto mb-4">{title}</h1>
	{/if}
	{@render children()}
</main>
