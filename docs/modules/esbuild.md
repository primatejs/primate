# esbuild

This module bundles your application's assets into single JavaScript and CSS
files. As it module uses the `bundle` hook, bundling will only occur if you
run Primate using `npx primate serve`.

## Install

`npm i @primate/esbuild`

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

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/esbuild
