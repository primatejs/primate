# esbuild

The [esbuild bundler module][repository] bundles your application's resources
into a single JavaScript and CSS file.

As this module uses the `bundle` hook, bundling will only occur if you run
Primate using `npx primate serve`.

## Install

`npm i @primate/esbuild`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import esbuild from "@primate/esbuild";

export default {
  modules: [esbuild()],
};
```

[repository]: https://github.com/primatejs/primate/tree/master/packages/esbuild
