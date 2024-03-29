# Types

This module adds common runtime types to your application.

## Install

`npm install @primate/types`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import types from "@primate/types";

export default {
  modules: [
    types(),
  ],
};
```

## Use

Similar to the types you define in `types`, the types included in this module
will be injected into the `body`, `path`, `query`, `cookies` and `headers`
properties of a request, as `getX` function, where `x` is the type's name. In
addition, all the types are exported for use in stores.

## Configuration options

### directory

Default `"types"`

The directory where types are located. If specified as a relative path, will
be relative to project root.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/types
