<script lang="ts">
    import Classifier from 'ml-classify-text';
    import {persisted, autosize} from '$lib';

    type ClassifierData = {
        enabled: boolean;
        object: string;
        attribute: string;
        text: string;
        category: string;
    }
    let data = persisted<ClassifierData[]>('selenite-commons-classifier-data', []);
    
    const categories = ['object', 'function', 'setname', 'cellBlock', 'acousticSolver'];
    function add() {
        $data = [...$data, {enabled: true, object:'', attribute: '', text: '', category: 'object'}];
    }
</script>
<section class="grid justify-items-center gap-4">
<h1 class="text-2xl font-bold">Classification</h1>
<ul class="space-y-2">
    {#each $data as item}
        <li class="flex gap-1 items-center">
            <input type="checkbox" class="checkbox" bind:checked={item.enabled}/>
            <input type="text" class="input input-bordered" bind:value={item.object} placeholder="Object"/>
            <input type="text" class="input input-bordered" bind:value={item.attribute} placeholder="Attribute"/>
            <textarea use:autosize class="textarea textarea-bordered w-[30rem]" bind:value={item.text}></textarea>
            <select bind:value={item.category} class="select select-bordered">
                {#each categories as category}
                    <option value={category}>{category}</option>
                {/each}
            </select>
        </li>
    {/each}
</ul>
<button class="btn" onclick={add}>Add</button>
</section>

