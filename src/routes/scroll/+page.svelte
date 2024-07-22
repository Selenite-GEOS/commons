<script lang="ts">
    import {horizontalScroll} from '$lib'
	import { range } from 'lodash-es';
    </script>

<div class="w-32 flex gap-2 overflow-x-auto" use:horizontalScroll>
    {#each range(100) as i}
    <span>{i}</span>

    {/each}
</div>