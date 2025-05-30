import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasmPack from 'vite-plugin-wasm-pack';
import tailwind from '@tailwindcss/vite';
export default defineConfig({
	plugins: [tailwind(), sveltekit(), wasmPack([], '@selenite/commons-rs')],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'happy-dom',
		coverage: {
			include: ['src/lib/**/*.{js,ts,svelte}'],
			exclude: ['src/lib/**/index.{js,ts}']
		}
	},
	ssr: {
		noExternal: ['svelte-fa', '@skeletonlabs/floating-ui-svelte']
	},
	server: {
		port: 5174
	}
});
