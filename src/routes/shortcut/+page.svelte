<script lang="ts">
	import { shortcut } from "$lib";

    let ctrl = $state(false);
</script>

<span use:shortcut={{ctrl: true, action(node, e) {
    ctrl = true;
}, endAction(node, e) {
    ctrl = false;
},}}>
    {ctrl ? "Ctrl" : "No Ctrl"}

</span>