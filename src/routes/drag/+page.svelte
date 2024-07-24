<script lang="ts">
	import { draggableItem } from '$lib';
	import { flip } from 'svelte/animate';

	const tabs = $state(['tab 1','tab 2', 'tab 3']);
	let flipDuration = 100;	
</script>

<div class="w-full grid justify-center">
	<div class="tabs tabs-lifted justify-start bg-base-300">
		{#each tabs as tab (tab)}
			<div
				class="tab"
				animate:flip={{ duration: flipDuration}}
				use:draggableItem={{ items: tabs, flipDuration }}
				class:tab-active={tab === 'tab 3'}>
				{tab}
			</div>
		{/each}
		<div class="tab btn-ghost">+</div>
		<div class="tab btn-ghost">{'>'}</div>
	</div>
</div>
