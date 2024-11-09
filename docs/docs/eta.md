# Eta

[Eta](https://eta.js.org) is a template engine and modern alternative to EJS.

## Features

|File Extension|Props|SSR|Hydration|SPA|Layouts|Head|I18N|
|-|-|-|-|-|-|-|-|
|`.eta`|✓|✓|-|-|✗|-|-|

## Install

{% install=@primate/eta %}

## Use

{% tabs %}

```js#primate.config.js
import eta from "@primate/eta";

export default {
  modules: [
    eta(/* EtaOptions */),
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
    return view("post-index.eta", { posts });
  },
};
```

```html#Component
<h1>All posts</h1>
<div>
<% it.posts.forEach(function(post){ %>
<h2><a href="/post/view/<%= post.id %>"><%= post.title %></a></h2>
<% }) %>
</div>
```

{% /tabs %}

## Options

```ts
interface EtaOptions {
  extension?: string,
}
```

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/eta
