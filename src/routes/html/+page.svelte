<script lang="ts">
	import { WindowState } from "$lib";

  const windowState = new WindowState();
</script>

<div class="grid-cols-2">
    <span>Width</span>
    <span>{windowState.width}</span>
    <span>Height</span>
    <span>{windowState.height}</span>


</div>