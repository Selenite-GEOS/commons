<script lang="ts">
	import { draggableItem } from '$lib';
	import { flip } from 'svelte/animate';

	const tabs = $state(['New graph', 'For each', 'tab 3']);
	let flipDuration = 100;
	let activeTab = $state('tab 3');
</script>

<div class="w-full grid justify-center">
	<div class="tabs tabs-lift justify-start bg-base-300">
		{#each tabs as tab (tab)}
			<button
				class="tab relative"
				animate:flip={{ duration: flipDuration }}
				use:draggableItem={{
					items: tabs,
					flipDuration,
					onDragStart() {
						activeTab = tab;
					}
				}}
				onclick={() => {
					activeTab = tab;
				}}
				class:tab-active={tab === activeTab}>
				{tab}
			</button>
		{/each}
		<div class="tab btn-ghost">+</div>
		<div class="tab btn-ghost">{'>'}</div>
	</div>
</div>
