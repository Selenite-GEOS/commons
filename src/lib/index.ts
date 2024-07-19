/**
 * This package provides a set of frequently used utilities, types and svelte actions for building projects
 * with Typescript and Svelte.
 * 
 * It is part of the Selenite initiative.
 * 
 * Be careful that some of the functions use WASM code from an associated package : *selenite-commons-rs*. 
 * Therefore, if you use tools like Vite or Rollup, you need to add a plugin to the configuration. 
 * 
 * An example of such a plugin is : https://github.com/nshen/vite-plugin-wasm-pack. It is used like this :
 * 
 * ```
 * // vite.config.ts
 * import wasmPack from 'vite-plugin-wasm-pack'
 * export default defineConfig({
	plugins: [
		wasmPack([], ['selenite-commons-rs']),
 * ...
 * ```
 * @module
 */

export * as Action from './actions'
export * from './actions/index.js'
export * as Utils from './utils'
export * from './utils/index.js'
export * as Types from './type'
export * from './type'