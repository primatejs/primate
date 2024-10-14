# Eta

Embedded JS template engine.

## Support matrix

|Extension|Props|Server-side rendering|Hydration|Layouts|Head component|I18N|
|-|-|-|-|-|-|-|
|`.eta`|✓|✓|-|[✗]|-|-|

## Install

```sh
npm install @primate/eta
```

## Init

```js caption=primate.config.js
import eta from "@primate/eta";

export default {
  modules: [
    eta(/* configuration */),
  ],
};
```

## Use

```html caption=components/post-index.eta
<h1>All posts</h1>
<div>
<% it.posts.forEach(function(post){ %>
<h2><a href="/post/view/<%= post.id %>"><%= post.title %></a></h2>
<% }) %>
</div>
```

```js caption=routes/eta.js
import view from "primate/handler/view";

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

## Configuration

### extension

Default `".eta"`

The file extension associated with Eta components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/eta
[✗]: https://github.com/primatejs/primate/issues/164
