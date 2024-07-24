<script lang="ts">
    import {horizontalScroll, scrollIntoView} from '$lib'
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