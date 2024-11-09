# Handlebars

[Handlebars](https://handlebarsjs.com) is a template engine largely compatible
with Mustache.

## Features

|File Extension|Props|SSR|Hydration|SPA|Layouts|Head|I18N|
|-|-|-|-|-|-|-|-|
|`.hbs`|✓|✓|-|-|✗|-|-|

## Install

{% install=@primate/handlebars %}

## Use

{% tabs %}

```js#primate.config.js
import handlebars from "@primate/handlebars";

export default {
  modules: [
    handlebars(/* HandlebarsOptions */),
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
    return view("post-index.hbs", { posts });
  },
};
```

```hbs#component
<h1>All posts</h1>
<div>
{{#each posts}}
<h2><a href="`/post/{{this.id}}">{{this.title}}</a></h2>
{{/each}}
</div>
```

{% /tabs %}

## Options

```ts
interface HandlebarsOptions {
  extension?: string,
}
```

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/handlebars
