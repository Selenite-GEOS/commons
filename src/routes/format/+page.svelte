<script lang="ts">
	import { Formatter } from '$lib';
	import Textarea from '$lib/components/Textarea.svelte';

	let content = $state(
		"Told you not to worry\n\
\tBut maybe that's a lie\n\
Honey, what's your hurry?\n\
\tWon't you stay inside?\n\n\
Remember not to get too close to stars\n\
\tThey're never gonna give you love like ours"
	);
</script>

<label class="flex flex-col">
	<span class="font-semibold mb-1 text-sm">Text to format</span>
	<Textarea bind:value={content} placeholder="Text to format" />
</label>

<h2 class="font-medium mb-2">Formatted</h2>
<Formatter {content} />
