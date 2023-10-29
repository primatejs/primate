# Liveview

This module adds liveview client loading to your application, turning it into a
SPA.

## Install

`npm install @primate/liveview`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import liveview from "@primate/liveview";

export default {
  modules: [
    liveview(),
  ],
};
```

## Use

Once loaded, this module works automatically.

The liveview module uses a special `X-Primate-Liveview` header to indicate to
the handler that instead of rendering the entire HTML page, only the reference
to the next component and its data are required and should be returned as JSON.
Accordingly, every frontend handler must implement support for this header, and 
currently Svelte, React and Solid handlers do.

## Configuration options

This module has no configuration options.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/liveview
