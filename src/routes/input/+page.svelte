<script>
	import { autosize } from '$lib';

	let content = $state('Text');

	$effect(() => {
		const interval = setInterval(addRandomContent, 100);
		return () => clearInterval(interval);
	});

	function addRandomContent() {
		content += ' ' + Math.random().toString(36).substring(7);
	}
</script>

<h1 class="text-2xl font-bold mx-auto">Textarea Autosize</h1>
<div class="grid justify-center items-center">
	<textarea
		use:autosize={content}
		bind:value={content}
		class="w-[20rem] textarea textarea-bordered textarea-primary"></textarea>
</div>
