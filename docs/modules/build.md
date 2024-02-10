# build

This module builds your application's assets into single JavaScript and CSS
files. In development mode (`npx primate`), the resulting build file won't be 
minified, as opposed to production mode (`npx primate serve`). Currently, the
only build system supported is `esbuild`.

This module also introduces live reload during development, refreshing the page
whenever you change a component.

## Install

`npm install @primate/build esbuild@0.20`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { esbuild } from "@primate/build";

export default {
  modules: [
    esbuild(),
  ],
};
```

## Configuration options

### ignores

Default `[]`

A list of extensions that the builder should ignore when bundling.

### options

Default `{}`

Any override options to pass to the underlying build system when building.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/build
