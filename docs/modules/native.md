# Native

This module allows you to compile your Primate project as a desktop
application.

!!!
Compilation is currently only supported using Bun. In the future, as runtimes
mature their compilation capabilities, we will add support for Node and Deno.
!!!

!!!
Bun currently has issues compiling binaries that run properly on MacOS x64
[under certain conditions][bun-compilation-issues].
!!!

## Install

`npm install @primate/native`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import native from "@primate/native";

export default {
  modules: [
    native(),
  ],
};
```

By default, when the application is launched, it will access `/` (the route
under `routes/index.js`. Change that by setting the `start` property during
configuration.

```js caption=primate.config.js
import native from "@primate/native";

export default {
  modules: [
    native({
      start: "/home",
    }),
  ],
};
```

## Compile

To compile your project, make sure you have Bun installed, and then run

`bun --bun x primate build desktop`

## Cross-compile

Choosing the `desktop` target will detect your current operating system and use
it as the compilation target. To cross-compile, specify the exact target.

`bun --bun x primate build linux-x64`

Currently available targets are `linux-x64`, `windows-x64`, `darwin-x64` and
`darwin-arm64`.

[bun-running-issues]: https://github.com/oven-sh/bun/issues/11959

## Configuration options

### start

Default `"/"`

The start URL of the application.

### debug

Default `false`

Whether the webview should be started in debug mode (with inspection tools
active) or not.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/native
