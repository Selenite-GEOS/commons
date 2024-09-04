<script lang="ts">
	import { isAlphaNumChar, shortcut } from '$lib';
	import MatchHighlighter from '$lib/components/MatchHighlighter.svelte';
	let ref = $state('dust');
	let content = $state(
		"I'm blown away\n\
Like a layer of dust on the floor\n\
Of the hall where we first met\n\
Trust was the first thing we lost that day"
	);
	let refInput = $state<HTMLInputElement>();
</script>

<input
	bind:this={refInput}
	bind:value={ref}
	placeholder="Reference"
	class="input input-bordered mb-4"
	use:shortcut={{
		shortcuts(e) {
			if (e.ctrlKey || e.shiftKey || e.altKey) return false;
			return isAlphaNumChar(e.key) || e.key === 'Backspace' || e.key === ' ';
		},
		action: (n, e) => {
			if (!refInput) return;
			if (e.key === 'Backspace') {
				refInput.value = refInput.value.slice(0, -1);
			} else refInput.value += e.key;
			refInput.focus();
		}
	}}
	onkeydown={(e) => e.key === 'Escape' && refInput?.blur()} />

{#each content.split('\n') as line}
	<p class="italic text-lg"><MatchHighlighter content={line} {ref} /></p>
{/each}
