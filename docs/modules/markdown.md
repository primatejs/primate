# Markdown

This handler module serves Markdown components with the `.md` extension.

## Install

`npm install @primate/markdown`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import markdown from "@primate/markdown";

export default {
  modules: [
    markdown(),
  ],
};
```
## Use

Create a Markdown file in `components`.

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

The rendered component will be accessible at http://localhost:6161/markdown.

## Configuration options

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
