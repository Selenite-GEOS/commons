<script lang="ts">
	import type { HTMLInputAttributes, HTMLLabelAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		bordered?: boolean;
		label?: string;
    labelProps?: HTMLLabelAttributes
	}

	let {
		value = $bindable(),
		label = '',
		checked = $bindable(),
		bordered = true,
    labelProps = {},
		...props
	}: Props = $props();
</script>

{#snippet input(defaultProps: HTMLInputAttributes = {})}
	{#if props.type === 'checkbox'}
		<input
      {...defaultProps}
			{...props}
			type="checkbox"
			class="input {props.class}"
			class:input-bordered={bordered}
			bind:checked />
	{:else}
		<input {...defaultProps} {...props} class="input {props.class}" class:input-bordered={bordered} bind:value />
	{/if}
{/snippet}

{#if !label}
	{@render input()}
{:else}
	<label {...labelProps}>
		{label}
		{@render input({placeholder: label})}
	</label>
{/if}
