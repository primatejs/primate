# Solid

This handler module supports SSR and hydration and serves Solid (JSX)
components with the `jsx` extension.

# Install

`npm i @primate/frontend`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { solid } from "@primate/frontend";

export default {
  modules: [
    solid(),
  ],
};
```

If you are using another JSX frontend module alongside Solid, consider changing
the file extension for Solid to something else, to avoid conflicts.

```js caption=primate.config.js
import { solid } from "@primate/frontend";

export default {
  modules: [
    solid({ extension: "solid" }),
  ],
};
```

## Use

Create a JSX component in `components`. This example assumes you have changed
the Solid component file extension to `solid`.

```jsx caption=components/PostIndex.solid
import { For } from "solid-js/web";

export default function PostIndex(props) {
  return <>
    <h1>All posts</h1>
    <For each={props.posts}>
      {post => <h2><a href={`/post/view/${post.id}`}>{post.title}</a></h2>}
    </For>
    <Test />
    <h3><a href="/post/edit/">add post</a></h3>
  </>;
}
```

Create a route and serve the Solid `PostIndex` component.

```js caption=routes/solid.js
import { view } from "primate";

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

Your rendered Solid component will be accessible at
http://localhost:6161/solid.

## Configuration options

### directory

Default `config.location.components`

Directory where the Solid JSX components reside.

### extension

Default `"jsx"`

The file extension to be associated with this handler.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
