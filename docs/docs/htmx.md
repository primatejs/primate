# HTMX

[HTMX] is a library that extends HTML with additional attributes.

## Features

|File Extension|Props|SSR|Hydration|SPA|Layouts|Head|I18N|
|-|-|-|-|-|-|-|-|
|`.htmx`|✓|✓|-|-|-|-|-|

## Install

{% install=@primate/htmx %}

## Use

{% tabs %}

```js#primate.config.js
import htmx from "@primate/htmx";

export default {
  modules: [
    htmx(/* HTMXOptions */),
  ],
};
```

```js#Route
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

```html#Component
<h1>All posts</h1>
${posts.map(post => `
  <h2>
    <a hx-get="/post/${post.id}" href="/post/${post.id}">
      ${post.title}
    </a>
  </h2>
`).join("")}
```

!!!
When you use HTMX to fetch content, it sends its request with the `hx-request`
header set. This header is used to return the component HTML in
[partial mode][partial]. The example above thus works with or without
JavaScript.
!!!

{% /tabs %}

## Options

```ts
type ClientSideTemplate = "handlebars" | "mustache" | "nunjucks";
type NonEmptyArray<T> = [T, ...T[]];

interface HTMXOptions {
  fileExtension?: string,
  extensions?: {
    clientSideTemplates?: NonEmptyArray<ClientSideTemplate>,
  },
}
```

## Resources

* [Repository][repo]
* [Error list](/errors/htmx)

[repo]: https://github.com/primatejs/primate/tree/master/packages/htmx
[extensions]: https://htmx.org/extensions
[client-side-templates]: https://htmx.org/extensions/client-side-templates
[partial]: /guide/responses#partial
[HTMX]: https://htmx.org
