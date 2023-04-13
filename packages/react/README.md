# Primate React module

## Install

`npm i @primate/react`

## Configure

Add to `primate.config.js`

```js
import react from "@primate/react";

export default {
  modules: [react()],
};
```

## Use

Create a [JSX][jsx] component in `components`, e.g. `PostIndex.jsx`.

```jsx
import React from "react";

export default class extends React.Component {
  render() {
    const {posts} = this.props;

    return (<>
      <h1>All posts</h1>
      {posts.map(({id, title}) => (
        <h2><a href={`/react/post/view/${id}`}>{title}</a></h2>
      ))}
      <h3><a href="/react/post/edit/">add post</a></h3>
    </>);
  }
}
```

Create a route, for example in `routes/react.js` (mapping `/react`).

```js
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
