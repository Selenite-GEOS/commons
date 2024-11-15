import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasmPack from 'vite-plugin-wasm-pack';
export default defineConfig({
	plugins: [sveltekit(), wasmPack([], '@selenite/commons-rs')],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'happy-dom',
		coverage: {
			include: ['src/lib/**/*.{js,ts,svelte}'],
			exclude: ['src/lib/**/index.{js,ts}']
		}
	},
	ssr: {
		noExternal: ['svelte-fa']
	},
	server: {
		port: 5174
	}
});
