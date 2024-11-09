# Svelte

Cybernetically enhanced web apps.

## Support matrix

|Extension|Props|Server-side rendering|Hydration|Layouts|Head component|I18N|
|-|-|-|-|-|-|-|
|`.svelte`|✓|✓|✓|✓|`<svelte:head>`|`@primate/i18n/svelte`|

## Install

```sh
npm install @primate/svelte
```

## Init

```js#primate.config.js
import svelte from "@primate/svelte";

export default {
  modules: [
    svelte(/* configuration */),
  ],
};
```

## Use

```svelte#components/PostIndex.svelte
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

```js#routes/svelte.js
import view from "primate/handler/view";

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

## Configuration

### extension

Default `".svelte"`

The file extension associated with Svelte components.

### spa

Whether single-page app browsing using `fetch` should be active.

Disabling this property will trigger a complete page load on every link click
and form submission, the standard browser behavior.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/svelte
