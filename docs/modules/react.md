# React

This handler module supports SSR and hydration and serves React (JSX)
components with the `jsx` extension.

## Install

`npm install @primate/frontend esbuild@0.19 react@18 react-dom@18`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { react } from "@primate/frontend";

export default {
  modules: [
    react(),
  ],
};
```

## Use

Create a JSX component in `components`.

```jsx caption=components/PostIndex.jsx
export default function PostIndex({ posts }) {
  return (<>
    <h1>All posts</h1>
    { posts.map(({ id, title }) => (
      <h2><a href={`/post/${id}`}>{title}</a></h2>
    )) }
  </>);
}
```

Create a route and serve the React `PostIndex` component.

```js caption=routes/react.js
import { view } from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.jsx", { posts });
  },
};
```

Your rendered React component will be accessible at
http://localhost:6161/react.

## Configuration options

### directory

Default `config.location.components`

Directory where the React JSX components reside.

### extension

Default `"jsx"`

The file extension to be associated with this handler.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
