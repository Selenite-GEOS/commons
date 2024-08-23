<script lang="ts">
	import type { ResizeHandleParams } from '$lib';
	import { persisted, PointerDownWatcher, resizeHandle as resizable } from '$lib';
    let all = $state(true);


    // $effect(() => {
    //     let interval = setInterval(() => {
    //         all = !all
    //     }, 1000)
    //     return () => {
    //         clearInterval(interval)
    //     }
    // })

    let node = $state<HTMLElement>()
        let width = 0
    $effect(() => {
        if (node) {
            width = node.getBoundingClientRect().width
        }
    })

    const persistedSize = persisted<{height?: number, width?: number}>('views-resizable-box', {})
    const onresize: ResizeHandleParams['onresize'] = ({width, height}) => {
        $persistedSize = {width, height}
    }
</script>

<h1 class="text-2xl font-bold">Resizable</h1>
<div bind:this={node} class="h-[10rem] w-[10rem] bg-pink-50" style="height: {$persistedSize.height}px; width: {$persistedSize.width}px" use:resizable={{ onresize}}></div>
