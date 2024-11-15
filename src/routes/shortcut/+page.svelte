<script lang="ts">
	import { shortcut } from '$lib';

	let ctrl = $state(false);
	let alt = $state(false);
</script>

<span
	use:shortcut={{
		ctrl: true,
		repeats: false,
		action() {
			ctrl = true;
		},
		endAction() {
			ctrl = false;
		}
	}}>
	{ctrl ? 'Ctrl' : 'No Ctrl'}
</span>

<span
	use:shortcut={{
		alt: true,
		repeats: true,
		action() {
			alt = true;
		},
		endAction() {
			alt = false;
		}
	}}>
	{alt ? 'Alt' : 'No Alt'}
</span>
