# Primate Svelte module

## Install

`npm i @primate/svelte`

## Configure

Add to `primate.config.js`

```js
import svelte from "@primate/svelte";

export default {
  modules: [svelte()],
};
```

If you use a bundler, specify an array of entry points:

```js
import svelte from "@primate/svelte";

export default {
  modules: [svelte({entryPoints: ["EntryPage.svelte"]})],
};
```
