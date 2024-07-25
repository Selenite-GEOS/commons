 # Selenite - Commons
 
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

 Be careful that some of the functions use WASM code from an associated package : *selenite-commons-rs*. 
 Therefore, if you use tools like Vite or Rollup, you need to add a plugin to the configuration. 
 
 An example of such a plugin is : https://github.com/nshen/vite-plugin-wasm-pack. It is used like this :
 
 ```
 // vite.config.ts
 import wasmPack from 'vite-plugin-wasm-pack'
 export default defineConfig({
	plugins: [
		wasmPack([], ['selenite-commons-rs']),
 ...
 ```

 ## Development
 The project is developed with Typescript and uses vitest for testing. It uses [Bun](https://bun.sh/docs/installation) as a package manager and builder. Be aware that at the time of writing, Bun is still unstable on Windows. 
 
 > If you need to works on Windows and encounter issues, don't hesitate to edit the project to use another package manager like pnpm. Do note that you will need to update the github action to reflect that change so that lockfiles match between dev and build.

 You can start the dev server with :
```bash
bun dev
```

## Publishing
The package will automatically be built and published (if there's a version change) when pushed to the main branch.

You can manually publish it on npm with the following command :
```bash
npm publish --access public
# rust code (selenite-commons-rs)
bun wasm-pack publish --access public
```

## TODO
Setup automatic rust code publishing