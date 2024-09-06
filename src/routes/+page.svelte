<script lang="ts">
	import { upperFirst } from "lodash-es";

    const routes = Object.keys(import.meta.glob("./**/+page.svelte")).map(path => path.slice(1, -"+page.svelte".length - 1))

</script>


<h1 class="text-2xl font-bold my-4">Selenite Commons</h1>

<ul class="menu bg-base-200 rounded-box text-xl">
    {#each routes as route}
        <li>
            <a href={route}>{upperFirst(route.slice(1).split("-").join(" "))}</a>
        </li>
    {/each}
</ul>

