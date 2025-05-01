<script lang="ts">
	import { Modal } from "$lib";

    function onclick() {
        Modal.instance.show({snippet: hello});
    }
</script>

{#snippet hello()}
    <h1>Hello, World!</h1>
    <p>This is a modal.</p>  
{/snippet}

<button class="btn" {onclick}>Open</button>
