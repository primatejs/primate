# Voby

This handler module serves Voby components with the `.voby` extension.

## Install

`npm install @primate/voby`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import voby from "@primate/voby";

export default {
  modules: [
    voby(),
  ],
};
```

## Use

Create a Voby component in `components`.

```html caption=components/PostIndex.voby
export default ({ posts, title }) => {
  return <>
    <h1>All posts</h1>
    {posts.map(({ id, title}) => <h2><a href={`/post/view/${id}`}>{title}</a></h2>)}
  </>;
}
```

Serve it from a route.

```js caption=routes/voby.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.voby", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/voby.

## Configuration options

### extension

Default `".voby"`

The file extension associated with Voby components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primate-run/primate/tree/master/packages/voby
