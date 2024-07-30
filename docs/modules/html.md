# HTML

This handler module serves HTML components with the `.html` extension.

## Install

`npm install @primate/frontend`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import html from "@primate/frontend/html";

export default {
  modules: [
    html(),
  ],
};
```

## Use

Create an HTML component in `components`.

```html caption=components/post-index.html
<h1>All posts</h1>
${posts.map(post => `
  <h2>
    <a href="/post/${post.id}">
      ${post.title}
    </a>
  </h2>
`).join("")}
```

Serve it from a route.

```js caption=routes/html.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("post-index.html", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/html.

## Configuration options

### extension

Default `".html"`

The file extension associated with HTML components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
