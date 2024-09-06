<script lang="ts">
	import { PathGenerator } from '$lib';

	let path: string[] = $state(['this']);
	let paths = $state(
		[
			'welcome/to/avatar/country',
			'told/you/not/to/worry',
			'welcome/to/my/story',
			'this/may/be/our/last/chance'
		].map((p) => p.split('/'))
	);
</script>

<div>
	<span class="font-semibold">Path</span>
	<PathGenerator bind:path {paths} class="w-[40rem]" />

	<h2 class="text-2xl font-bold">Result</h2>
	<p class="text-xl">{path.join('/')}</p>
</div>
