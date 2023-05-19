# Svelte

This handler module supports SSR and hydration and serves Svelte components
with the `.svelte` extension.

## Install

`npm i @primate/svelte`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import svelte from "@primate/svelte";

export default {
  modules: [svelte()],
};
```

If you're using a bundler, specify an array of entry points.

```js caption=primate.config.js
import svelte from "@primate/svelte";

export default {
  modules: [svelte({entryPoints: ["PostIndex.svelte"]})],
};
```

## Use

Create a Svelte component in `components`.

```html caption=components/PostIndex.svelte
<script>
  export let posts;
</script>
<h1>All posts</h1>
{#each posts as {id, title}}
<h2><a href="/svelte/post/{id}">{title}</a></h2>
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

Create a route and serve the Svelte `PostIndex` component.

```js caption=routes/svelte.js
import {view} from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.svelte", {posts});
  },
};
```

Your rendered Svelte route will be accessible at
http://localhost:6161/svelte.

## Configuration options

### directory

Default `config.paths.components`

Directory where the Svelte components reside.

### entryPoints

Default `[]`

Array of component names that serve as entry points. This information is
valuable to a bundle for deciding what files are relevant as starting input for
bundling.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/svelte
