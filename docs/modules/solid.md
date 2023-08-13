# Solid

This handler module supports SSR and hydration and serves Solid (JSX)
components with the `.jsx` extension.

## Install

`npm i @primate/solid`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import react from "@primate/solid";

export default {
  modules: [
    solid(),
  ],
};
```

If you are using another JSX frontend module alongside Solid, consider changing
the file extension for Solid to something else, to avoid conflicts.

```js caption=primate.config.js
import react from "@primate/solid";

export default {
  modules: [
    solid({extension: "solid"}),
  ],
};
```

## Use

Create a JSX component in `components`.

```jsx caption=components/PostIndex.jsx
export default function PostIndex({data: {posts}}) {
  return (<>
    <h1>All posts</h1>
    {posts.map(({id, title}) => (
      <h2><a href={`/react/post/${id}`}>{title}</a></h2>
    ))}
  </>);
}
```

Create a route and serve the Solid `PostIndex` component.

```js caption=routes/solid.js
import {view} from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.jsx", {posts});
  },
};
```

Your rendered Solid component will be accessible at
http://localhost:6161/solid.

## Configuration options

### dynamicProps

Default `"data"`

Name of the props passed to a Svelte component from its route.

### extension

Default `"jsx"`

The file extension to be associated with this handler.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/react
