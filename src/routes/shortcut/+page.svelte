<script lang="ts">
	import { shortcut } from "$lib";

    let ctrl = $state(false);
    let alt = $state(false);
</script>

<span use:shortcut={{ctrl: true, repeats: false, action(node, e) {
    ctrl = true;
}, endAction(node, e) {
    ctrl = false;
},}}>
    {ctrl ? "Ctrl" : "No Ctrl"}

</span>

<span use:shortcut={{alt: true, repeats: true, action(node, e) {
    alt = true;
}, endAction(node, e) {
    alt = false;
},}}>
    {alt ? "Alt" : "No Alt"}
</span>