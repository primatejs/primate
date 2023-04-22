# React handler

The [React handler module][repository] supports SSR and serves React (JSX)
components with the `.jsx` extension.

## Install

`npm i @primate/react`

## Load

Import and initialize the module in your configuration.

```js file=primate.config.js
import react from "@primate/react";

export default {
  modules: [react()],
};
```

## Use

Create a JSX component in `components`.

```jsx file=components/PostIndex.jsx
import React from "react";

export default class extends React.Component {
  render() {
    const {posts} = this.props;

    return (<>
      <h1>All posts</h1>
      {posts.map(({id, title}) => (
        <h2><a href={`/react/post/${id}`}>{title}</a></h2>
      ))}
    </>);
  }
}
```

Create a route and serve the React `PostIndex` component.

```js file=routes/react.js
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

## Configuration options

### directory

Directory where the JSX components reside. Defaults to
`config.paths.components`.

[repository]: https://github.com/primatejs/primate/tree/master/packages/react
