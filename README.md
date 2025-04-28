# Selenite Commons

This typescript package provides a set of frequently used utilities, types and svelte actions for building projects
with Typescript and Svelte.

It is part of the Selenite initiative.

[Documentation](https://shaitanlyss.github.io/selenite-commons/modules.html)

## Usage

This package can be installed in your project with any package manager :

```bash
npm i @selenite/commons
yarn add @selenite/commons
pnpm i @selenite/commons
bun i @selenite/commons
```

Be careful that some of the functions use WASM code from an associated package : _selenite-commons-rs_.
Therefore, if you use tools like Vite or Rollup, you need to add a plugin to the configuration.

An example of such a plugin is : https://github.com/nshen/vite-plugin-wasm-pack. It is used like this :

```
// vite.config.ts
import wasmPack from 'vite-plugin-wasm-pack'
export default defineConfig({
	plugins: [
		wasmPack([], ['@selenite/commons-rs']),
...
```

## Development

The project is developed with Typescript and uses vitest for testing. It uses [pnpm](https://pnpm.io/installation) as a package manager and builder.

You can start the dev server with :

```bash
pnpm dev
```

## Documentation

The documentation is generated with TypeDoc and can be built with the following command :

```bash
pnpm docgen
```

It will then be accessible in the [docs folder](./docs).

## Publishing

The package will automatically be built and published (if there's a version change) when pushed to the main branch.

You can manually publish it on npm with the following command :

```bash
npm publish --access public
# rust code (selenite-commons-rs)
pnpm wasm-pack publish --access public
```

## TODO

- Document everything
- Create action to use text content as title | and which adds truncate by default (with css)
- Try removing newline at end of xml format
- Add Portal Component
- Make custom tailwind plugin regrouping all the tailwind plugins used and the configuration
