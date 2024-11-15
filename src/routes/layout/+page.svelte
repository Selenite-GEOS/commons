<script lang="ts">
	import {
		getAlignBottomOffsets,
		getAlignMiddleOffsets,
		getAlignTopOffsets,
		getJustifyCenterOffsets,
		getJustifyLeftOffsets,
		getJustifyRightOffsets,
		getJustifyBetweenOffsets,
		getAlignBetweenOffsets,
		Vector2D,
		type LayoutRect
	} from '$lib';
	import { zip } from 'lodash-es';
	import { flip } from 'svelte/animate';

	const rects: LayoutRect[] = $state([
		{
			x: 80,
			y: 40,
			h: 30,
			w: 20
		},
		{
			x: 10,
			y: 20,
			h: 40,
			w: 60
		},
		{
			x: 160,
			y: -40,
			h: 40,
			w: 40
		}
	]);

	let ref = $state(0);

	function applyOffsets(offsets: Vector2D[]) {
		for (const [rect, o] of zip(rects, offsets)) {
			if (!rect || !o) {
				continue;
			}
			rect.x += o.x;
			rect.y += o.y;
		}
	}

	function alignTop() {
		const offsets = getAlignTopOffsets(rects, { refPos: ref });
		applyOffsets(offsets);
	}

	function alignBottom() {
		const offsets = getAlignBottomOffsets(rects, { refPos: ref });
		console.log(offsets);
		applyOffsets(offsets);
	}

	function alignMiddle() {
		const offsets = getAlignMiddleOffsets(rects, { refPos: ref });
		applyOffsets(offsets);
	}

	function spaceEventHorizontally() {
		applyOffsets(getJustifyBetweenOffsets(rects));
	}

	function alignBetween() {
		applyOffsets(getAlignBetweenOffsets(rects));
	}

	function justifyLeft() {
		const offsets = getJustifyLeftOffsets(rects, { refPos: ref });
		applyOffsets(offsets);
	}

	function justifyRight() {
		const offsets = getJustifyRightOffsets(rects, { refPos: ref });
		applyOffsets(offsets);
	}

	function justifyCenter() {
		const offsets = getJustifyCenterOffsets(rects, { refPos: ref });
		applyOffsets(offsets);
	}
</script>

<div class="h-full grow place-content-center justify-center m-auto-translate-y-[40px]">
	<div class="-translate-y-[120px] space-y-2">
		<div class="font-bold text-xl text-center mb-4">
			Ref: {ref}
		</div>
		<div class="flex justify-center gap-2">
			<button class="btn btn-neutral" onclick={alignTop}>Align top</button>
			<button class="btn btn-neutral" onclick={alignMiddle}>Align middle</button>
			<button class="btn btn-neutral" onclick={alignBottom}>Align bottom</button>
			<button class="btn btn-neutral" onclick={alignBetween}>Space vertically</button>
		</div>
		<div class="flex justify-center gap-2">
			<button class="btn btn-neutral" onclick={justifyLeft}>Justify left</button>
			<button class="btn btn-neutral" onclick={justifyCenter}>Justify center</button>
			<button class="btn btn-neutral" onclick={justifyRight}>Justify right</button>
			<button class="btn btn-neutral" onclick={spaceEventHorizontally}>Space horizontally</button>
		</div>
	</div>
	<div class="relative m-auto translate-x-[100px]">
		{#each rects as rect, i (rect)}
			<button
				class="absolute bg-base-300 text-center align-middle grid items-center"
				style="transform: translate({rect.x}px, {rect.y}px); width: {rect.w}px; height:{rect.h}px;"
				onclick={() => (ref = i)}
				animate:flip>
				{i}
			</button>
		{/each}
	</div>
</div>
