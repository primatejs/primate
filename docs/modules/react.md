# React

This handler module supports SSR and hydration and serves React (JSX) components
with the `jsx` filename extension.

## Install

`npm i @primate/react`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import react from "@primate/react";

export default {
  modules: [
    react(),
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

Create a route and serve the React `PostIndex` component.

```js caption=routes/react.js
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

Your rendered React component will be accessible at
http://localhost:6161/react.

!!!
Any props you pass to your React component from your route will be exposed
as the `data` property of its props.
!!!

## Configuration options

### directory

Default `config.location.components`

Directory where the React JSX components reside.

### dynamicProps

Default `"data"`

Name of the props passed to a Svelte component from its route.

### extension

Default `"jsx"`

The file extension to be associated with this handler.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
