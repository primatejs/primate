# HTML

[HTML](https://html.spec.whatwg.org) components with props support.

## Features

|File Extension|Props|SSR|Hydration|SPA|Layouts|Head|I18N|
|-|-|-|-|-|-|-|-|
|`.html`|✓|✓|-|-|-|-|-|

## Install

{% install=@primate/html %}

## Use

{% tabs %}

```js#primate.config.js
import html from "@primate/html";

export default {
  modules: [
    html(/* HTMLOptions */),
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
    return view("post-index.html", { posts });
  },
};
```

```html#Component
<h1>All posts</h1>
${posts.map(post => `
  <h2>
    <a href="/post/${post.id}">
      ${post.title}
    </a>
  </h2>
`).join("")}
```

{% /tabs %}

## Options

```ts
interface HTMLOptions {
  extension?: string,
}
```

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/html
