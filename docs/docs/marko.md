# Marko

A declarative, HTML-based language.

## Support matrix

|Extension|Props|Server-side rendering|Hydration|Layouts|Head component|I18N|
|-|-|-|-|-|-|-|
|`.marko`|✓|✓|-|[✗]|-|-|

## Install

```sh
npm install @primate/marko
```

## Init

```js caption=primate.config.js
import marko from "@primate/marko";

export default {
  modules: [
    marko(/* configuration */),
  ],
};
```

## Use

```marko caption=components/post-index.marko
<h1>All posts</h1>
<for|post| of=input.posts>
  <h2>
    <a href="/post/view/${post.id}">
      ${post.title}
    </a>
  </h2>
</for>
```

```js caption=routes/marko.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("post-index.marko", { posts });
  },
};
```

## Configuration

### extension

Default `".marko"`

The file extension associated with Marko components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/marko
[✗]: https://github.com/primatejs/primate/issues/164
