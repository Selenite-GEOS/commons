<script lang="ts">
	import {
		parseXsdFromUrl,
		type SimpleType,
		type XmlSchema,
		type ComplexType,
		type Attribute
	} from '$lib/utils/xsd';
	import type { Snippet } from 'svelte';

	let xmlSchema = $state<XmlSchema>();

	$effect(() => {
		parseXsdFromUrl('/geos_schema.xsd').then((schema) => (xmlSchema = schema));
	});

	$effect(() => {
		if (xmlSchema) console.log($state.snapshot(xmlSchema));
	});
</script>

{#snippet summary(
	title: string,
	content: Snippet<[unknown]>,
	values: unknown[],
	classes?: string,
	header?: string
)}
	<summary class={classes ?? 'mx-6 mb-4'}>
		<h2 class="{header ?? 'text-xl font-semibold'} mb-2 col-span-full">
			{title} ({values.length})
		</h2>
		<details>
			<ul class="mt-2 w-full overflow-x-hidden grid grid-cols-2 gap-4">
				{#each values as value}
					<li class="truncate">
						{@render content(value)}
					</li>
				{/each}
			</ul>
		</details>
	</summary>
{/snippet}

{#snippet SimpleType(simple: SimpleType)}
	<h3 class="font-semibold">{simple.name}</h3>
	<div>
		<p class="truncate" title={simple.pattern}>Pattern : {simple.pattern}</p>
		<p class="truncate" title={simple.doc}>Doc : {simple.doc}</p>
		<p class="truncate">Options: {simple.options?.join(' | ')}</p>
	</div>
{/snippet}

{#snippet Attribute(attr: Attribute)}
	<section>
		<div class="flex gap-2 truncate" title={`${attr.name}${attr.required?'*':''} ${attr.default !== undefined ? attr.default : ''}`}>
		<h4 class="font-semibold">
			{attr.name}{#if attr.required}*{/if}
		</h4>
		{#if attr.default !== undefined}<span class="row-start-1"> ({attr.default}) </span>{/if}
		</div>
		<h5>{attr.type}</h5>
		<p class="text-wrap italic" title={attr.doc}>{attr.doc}</p>
	</section>
{/snippet}

{#snippet ComplexType(complex: ComplexType)}
	<h3 class="font-semibold mb-2">{complex.name}</h3>
	<div class="ms-4">
		{#if complex.doc}
			<p class="truncate" title={complex.doc}>Doc : {complex.doc}</p>
		{/if}
		{#if complex.children}
			<p class="truncate" title={complex.children?.join(' | ')}>
				Children: {complex.children?.join(' | ')}
			</p>
		{/if}
		{@render summary(
			'Attributes',
			Attribute as Snippet<[unknown]>,
			complex.attrs,
			'mt-2',
			'italic'
		)}
	</div>
{/snippet}

<section class="grid columns-2 gap-x-4">
	{#if xmlSchema}
		<h1 class="text-2xl font-bold mb-2 col-span-full">GEOS XML Schema</h1>
		{@render summary('Simple types', SimpleType as Snippet<[unknown]>, xmlSchema.simpleTypes)}
		{@render summary('Complex types', ComplexType as Snippet<[unknown]>, xmlSchema.complexTypes)}
	{/if}
</section>
