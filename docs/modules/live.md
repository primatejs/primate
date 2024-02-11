# Live

This module adds reactive server values to your application.

## Install

`npm install @primate/live`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import live from "@primate/live";

export default {
  modules: [
    live(),
  ],
};
```

## Use

This module exposes a `writable` function that generates reactive server
values. Passing those values to a component from a route and later updating
them via the `set` method will cause an update to the value on the client using
WebSockets.

```js caption=routes/live.js
import { view } from "primate";
import { writable } from "@primate/live";

export default {
  get() {
    let i = 0;
    const count = writable(i);
    // will update count every 2 seconds
    setInterval(() => { count.set(i++); }, 2000);
    return view("svelte/Live.svelte", { count });
  },
};
```

The corresponding Svelte component looks as follows.

```svelte caption=components/LiveCounter.svelte
<script>
  export let count;
</script>

<h1>count: {count}</h1>
```

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/live
