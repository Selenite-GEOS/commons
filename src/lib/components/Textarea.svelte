<script lang="ts">
	import { autosize } from '$lib/actions';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		bordered?: boolean;
		value?: string;
		autosize?: boolean;
	}

	let {
		value = $bindable(),
		bordered = true,
		autosize: bAutosize = true,
		...props
	}: Props = $props();
</script>

<textarea
	use:autosize={bAutosize}
	{...props}
	bind:value
	class="textarea"
	class:textarea-bordered={bordered}></textarea>
