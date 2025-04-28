<script lang="ts">
	import { isAlphaNumChar, shortcut, MatchHighlighter } from '$lib';
	let ref = $state('dust');
	let content = $state(
		"I'm blown away\n\
Like a layer of dust on the floor\n\
Of the hall where we first met\n\
Trust was the first thing we lost that day"
	);
	let refInput = $state<HTMLInputElement>();
	let outline = $state(false);
</script>

<input
	bind:this={refInput}
	bind:value={ref}
	placeholder="Reference"
	class="input mb-2"
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
<label class="flex items-center gap-4 cursor-pointer">
	Outline
	<input type="checkbox" class="checkbox" bind:checked={outline} />
</label>

<h2 class="mt-2 mb-2 font-bold">Song</h2>
{#each content.split('\n') as line}
	<p class="italic text-lg"><MatchHighlighter content={line} {ref} {outline} /></p>
{/each}

<h2 class="mt-8 mb-2 font-bold">Word</h2>
<p class="italic text-lg"><MatchHighlighter content={'galaxy'} {ref} {outline} /></p>

<h2 class="mt-8 mb-2 font-bold">Backslashes</h2>
<p class="italic text-lg"><MatchHighlighter content={'galaxy/super-nova'} {ref} {outline} /></p>
