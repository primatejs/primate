# Solid

This handler module supports SSR and hydration and serves Solid (JSX)
components with the `.jsx` extension.

## Install

`npm install @primate/frontend @babel/core babel-preset-solid solid-js`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import solid from "@primate/frontend/solid";

export default {
  modules: [
    solid(),
  ],
};
```

If you're using another JSX frontend module alongside Solid, consider changing
the file extension for Solid to something else, to avoid conflicts.

```js caption=primate.config.js
import solid from "@primate/frontend/solid";

export default {
  modules: [
    solid({
      extension: ".solid",
    }),
  ],
};
```

## Use

Create a JSX component in `components`. This example assumes you have changed
the Solid component file extension to `.solid`.

```jsx caption=components/PostIndex.solid
import { For } from "solid-js/web";

export default function PostIndex(props) {
  return <>
    <h1>All posts</h1>
    <For each={props.posts}>
      {post => <h2><a href={`/post/${post.id}`}>{post.title}</a></h2>}
    </For>
  </>;
}
```

Serve it from a route.

```js caption=routes/solid.js
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

The rendered component will be accessible at http://localhost:6161/solid.

## Configuration options

### extension

Default `".jsx"`

The file extension associated with Solid JSX components.

### spa

Default `true`

Whether SPA browsing using `fetch` should be active.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
