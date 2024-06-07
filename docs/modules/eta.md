# Eta 

This handler module serves Eta components with the `.eta` extension.

## Install

`npm install @primate/frontend eta@3`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { eta } from "@primate/frontend";

export default {
  modules: [
    eta(),
  ],
};
```

## Use

Create a Eta component in `components`.

```html caption=components/post-index.eta
<h1>All posts</h1>
<div>
<% it.posts.forEach(function(post){ %>
<h2><a href="/post/view/<%= post.id %>"><%= post.title %></a></h2>
<% }) %>
</div>
```

Serve it from a route.

```js caption=routes/eta.js
import { view } from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("post-index.eta", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/eta.

## Configuration options

### extension

Default `".eta"`

The file extension associated with Eta components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
