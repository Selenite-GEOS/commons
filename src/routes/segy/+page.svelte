<script lang="ts">
	import { readSEGYInfo } from '$lib';

	$effect(() => {
		(async () => {
			console.log(await readSEGYInfo());
		})();
	});
</script>
