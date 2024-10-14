# Markdown

Text-to-HTML conversion tool for web writers.

## Support matrix

|Extension|Props|Server-side rendering|Hydration|Layouts|Head component|I18N|
|-|-|-|-|-|-|-|
|`.md`|[✗]|✓|-|-|-|-|

## Install

```sh
npm install @primate/markdown
```

## Init

```js caption=primate.config.js
import markdown from "@primate/markdown";

export default {
  modules: [
    markdown(/* configuration */),
  ],
};
```
## Use

```md caption=components/PostIndex.md
# Posts

## Post1

This is the **first** post
```

Serve it from a route.

```js caption=routes/markdown.js
import view from "primate/handler/view";

export default {
  get() {
    return view("PostIndex.md");
  },
};
```

## Configuration

### extension

Default `".md"`

The file extension associated with Markdown components.

### options

Default `{}`

Options to be passed to the underlying `marked` package.

### renderer

Default `(...) => Response`

An alternative renderer. The default renderer renders the compiled Markdown as
HTML.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/markdown
[✗]: https://github.com/primatejs/primate/issues/164
