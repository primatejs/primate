# esbuild

This module bundles your application's assets into single JavaScript and CSS
files. As it uses the `bundle` hook, bundling will only occur if you run
Primate using `npx primate serve`.

## Install

`npm install @primate/esbuild`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import esbuild from "@primate/esbuild";

export default {
  modules: [
    esbuild(),
  ],
};
```

## Configuration options

### ignores

Default `[]`

A list of extensions that esbuild should ignore when bundling.

### options

Default `{}`

Any override options to pass to `esbuild` when building.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/esbuild
