<script>
	import { checkbox, keyboardNavigation } from '$lib';
	import { range } from 'lodash-es';
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<section>
	<h1 class="text-2xl font-bold mb-2">Checkbox action</h1>
	<p class="mb-4">Hold to trigger multiple checkboxes.</p>
	<ul class="grid gap-2 justify-center">
		{#each range(10) as i}
        <label class="flex gap-2 items-center">
            {i}
			<input use:checkbox use:keyboardNavigation />
            </label>
		{/each}
	</ul>
</section>
