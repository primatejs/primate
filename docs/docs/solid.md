# Solid

A declarative, efficient, and flexible JavaScript library for building user
interfaces.

## Support matrix

|Extension|Props|SSR|Hydration|Layouts|Head|I18N|
|-|-|-|-|-|-|-|
|`.jsx`|✓|✓|✓|✓|`@primate/solid/head`|`@primate/i18n/solid`|

## Install

```sh
npm install @primate/solid
```

## Init

```js#primate.config.js
import solid from "@primate/solid";

export default {
  modules: [
    solid(/* configuration */),
  ],
};
```

## Use

```jsx#components/PostIndex.jsx
import { For } from "solid-js/web";

export default props => <>
  <h1>All posts</h1>
  <For each={props.posts}>
    {post => <h2><a href={`/post/${post.id}`}>{post.title}</a></h2>}
  </For>
</>;
```

```js#routes/solid.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.solid", { posts });
  },
};
```

## Configuration

### extension

Default `".jsx"`

The file extension associated with Solid JSX components.

If you're using another JSX frontend framework alongside Solid, consider
changing the file extension for Solid to something else (like `".solid"`), to
avoid conflicts.

### spa

Default `true`

Whether single-page app browsing using `fetch` should be active.

Disabling this property will trigger a complete page load on every link click
and form submission, the standard browser behavior.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/solid
