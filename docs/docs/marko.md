# Marko

[Marko] is a declarative HTML-based language for building web apps.

## Features

|File Extension|Props|SSR|Hydration|SPA|Layouts|Head|I18N|
|-|-|-|-|-|-|-|-|
|`.marko`|✓|✓|-|✗|-|-|-|

## Install

{% install=@primate/marko %}

## Use

{% tabs %}

```js#primate.config.js
import marko from "@primate/marko";

export default {
  modules: [
    marko(/* configuration */),
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
    return view("post-index.marko", { posts });
  },
};
```

```marko#Component
<h1>All posts</h1>
<for|post| of=input.posts>
  <h2>
    <a href="/post/view/${post.id}">
      ${post.title}
    </a>
  </h2>
</for>
```

{% /tabs %}

## Options

```ts
interface MarkoOptions {
  fileExtension?: string,
}
```

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/marko
[Marko]: https://markojs.com
