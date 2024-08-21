<script lang="ts">
	import { animationFrame } from "$lib";


</script>

<button class="btn" onclick={async () => {
    await animationFrame(10);
    console.log('animationFrame');
}}>Animation Frame</button>