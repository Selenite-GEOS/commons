<script lang="ts">
	import { horizontalScroll, scrollIntoView } from '$lib';
	import { range } from 'lodash-es';
</script>

<div class="w-32 flex gap-2 overflow-x-auto m-auto" use:horizontalScroll>
	{#each range(100) as i}
		<span>{i}</span>
	{/each}
</div>
<div class="w-32 flex gap-2 overflow-x-auto m-auto" use:horizontalScroll>
	{#each range(100) as i}
		<span use:scrollIntoView={i === 99}>{i}</span>
	{/each}
</div>
<div class="w-32 flex gap-2 overflow-x-auto m-auto" use:horizontalScroll>
	{#each range(100) as i}
		<span use:scrollIntoView={i === 57}>{i}</span>
	{/each}
</div>
<div class="w-32 flex gap-2 overflow-x-auto m-auto" use:horizontalScroll>
	{#each range(100) as i}
		<span use:scrollIntoView={i === 80}>{i}</span>
	{/each}
</div>

<h3 class="mt-4 mb-2 font-medium">Vertical scroll</h3>
<div class="w-32 flex flex-col max-h-32 gap-2 overflow-x-auto m-auto" use:horizontalScroll>
	{#each range(100) as i}
		<span use:scrollIntoView={i === 40}>{i}</span>
	{/each}
</div>