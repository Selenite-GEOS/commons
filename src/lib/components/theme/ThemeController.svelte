<script lang="ts">
	import { upperFirst } from 'lodash-es';
	import { persisted, scrollIntoView } from '$lib';
	import { themes as defaultThemes } from './theme';

	interface Props {
		themes?: string[];
		theme?: string;
	}
	const savedTheme = persisted('theme', 'dark');

	let {
		themes = Array.from(defaultThemes.values()),
		theme: activeTheme = $bindable($savedTheme)
	}: Props = $props();

	$effect(() => {
		$savedTheme = activeTheme;
	});
</script>

<div class="dropdown dropdown-end mb-72">
	<button
		tabindex="0"
		type="button"
		class="btn m-1"
		onfocus={() => {
			const activeElmnt = document.querySelector(`input[value="${activeTheme}"]`);
			console.log(activeElmnt);
			if (!activeElmnt) return;
			setTimeout(() => activeElmnt.scrollIntoView({ behavior: 'smooth', block: 'center' }));
		}}>
		Theme
		<svg
			width="12px"
			height="12px"
			class="inline-block h-2 w-2 fill-current opacity-60"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 2048 2048">
			<path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
		</svg>
	</button>
	<ul
		tabindex="0"
		class="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl max-h-45 overflow-y-auto"
		role="radiogroup">
		{#snippet Theme(theme: string)}
			{@const isActiveTheme = theme === activeTheme}
			<li>
				<input
					type="radio"
					name="theme-dropdown"
					class="theme-controller btn btn-sm btn-block {isActiveTheme
						? 'btn-accent'
						: 'btn-ghost'} justify-start"
					bind:group={activeTheme}
					aria-label={upperFirst(theme)}
					value={theme} />
			</li>
		{/snippet}
		<!-- {@render Theme('default')} -->
		{#each themes as theme}
			{@render Theme(theme)}
		{/each}
	</ul>
</div>
