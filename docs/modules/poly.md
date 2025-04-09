# Poly

This handler module supports SSR and hydration and serves Poly (Svelte 4) 
components with the `.poly` extension.

## Install

`npm install @primate/poly`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import poly from "@primate/poly";

export default {
  modules: [
    poly(),
  ],
};
```

## Use

Create a Poly component in `components`.

```svelte caption=components/PostIndex.poly
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

```js caption=routes/poly.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.poly", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/poly.

## Configuration options

### extension

Default `".poly"`

The file extension associated with Poly components.

### spa

Default `true`

Whether SPA browsing using `fetch` should be active.

## Resources

* [Repository][repo]

[repo]: https://github.com/primate-run/primate/tree/master/packages/poly
