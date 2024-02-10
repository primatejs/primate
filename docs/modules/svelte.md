# Svelte

This handler module supports SSR and hydration and serves Svelte components
with the `.svelte` extension.

## Install

`npm install @primate/frontend svelte@4`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { svelte } from "@primate/frontend";

export default {
  modules: [
    svelte(),
  ],
};
```

## Use

Create a Svelte component in `components`.

```svelte caption=components/PostIndex.svelte
<script>
  export let posts;
</script>
<h1>All posts</h1>
{#each posts as { id, title }}
<h2><a href="/post/{id}">{title}</a></h2>
{/each}
<style>
  button {
    border-radius: 4px;
    background-color: #5ca1e1;
    border: none;
    color: #fff;
    display: block;
  }
</style>
```

Serve it from a route.

```js caption=routes/svelte.js
import { view } from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.svelte", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/svelte.

## Configuration options

### extension

Default `".svelte"`

The file extension associated with Svelte components.

### spa

Default `true`

Whether SPA browsing using `fetch` should be active. 

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
