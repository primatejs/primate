# HTMX

This handler module serves HTMX components with the `.htmx` extension.

## Install

`npm install @primate/htmx`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import htmx from "@primate/htmx";

export default {
  modules: [
    htmx(),
  ],
};
```

## Use

Create an HTMX component in `components`.

```html caption=components/post-index.htmx
<h1>All posts</h1>
${posts.map(post => `
  <h2>
    <a hx-get="/post/${post.id}" href="/post/${post.id}">
      ${post.title}
    </a>
  </h2>
`).join("")}
```

Serve it from a route.

```js caption=routes/htmx.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("post-index.htmx", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/htmx.

!!!
When you use HTMX to fetch content, it sends its request with the `hx-request`
header set. This header is used to return the component HTML in
[partial mode][partial]. The example above thus works with or without
JavaScript.
!!!

## Configuration options

### extension

Default `".htmx"`

The file extension associated with HTMX components.

### extensions

Default `[]`

HTMX [extensions] to load, as an array of strings denoting the extension name.

### client_side_templates

Default `[]`

Client side templates to be used by the [client-side-templates] extension.
Possible values: `"handlebars"`, `"mustache"` and `"nunjucks"`. Make sure you
add `"client-side-templates"` to the `extensions` array option.

## Resources

* [Repository][repo]
* [Error list](/errors/htmx)

[repo]: https://github.com/primate-run/primate/tree/master/packages/htmx
[extensions]: https://htmx.org/extensions
[client-side-templates]: https://htmx.org/extensions/client-side-templates
[partial]: /guide/responses#partial
