# Handlebars

Minimal templating on steroids.

## Support matrix

|Extension|Server-side rendering|Hydration|Layouts|Head component|I18N|
|-|-|-|-|-|-|
|`.hbs`|✓|-|[✗]|-|-|

## Install

```sh
npm install @primate/handlebars
```

## Init

```js caption=primate.config.js
import handlebars from "@primate/handlebars";

export default {
  modules: [
    handlebars(/* configuration */),
  ],
};
```

## Use

```hbs caption=components/post-index.hbs
<h1>All posts</h1>
<div>
{{#each posts}}
<h2><a href="`/post/{{this.id}}">{{this.title}}</a></h2>
{{/each}}
</div>
```

```js caption=routes/hbs.js
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

## Configuration

### extension

Default `".hbs"`

The file extension associated with Handlebars components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/handlebars
[✗]: https://github.com/primatejs/primate/issues/164
