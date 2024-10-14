# HTML

Hypertext Markup Language.

## Support matrix

|Extension|Props|Server-side rendering|Hydration|Layouts|Head component|I18N|
|-|-|-|-|-|-|-|
|`.html`|✓|✓|-|[✗]|-|-|

## Install

```sh
npm install @primate/html
```

## Init

```js caption=primate.config.js
import html from "@primate/html";

export default {
  modules: [
    html(/* configuration */),
  ],
};
```

## Use

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

## Configuration

### extension

Default `".html"`

The file extension associated with HTML components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/html
[✗]: https://github.com/primatejs/primate/issues/164
