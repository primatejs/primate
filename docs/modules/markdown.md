# Markdown

This handler module serves Markdown components with the `md` extension.

## Install

`npm install @primate/frontend marked@10`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { markdown } from "@primate/frontend";

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

Create a route and serve the Markdown `PostIndex` component.

```js caption=routes/markdown.js
import { view } from "primate";

export default {
  get() {
    return view("PostIndex.md");
  },
};
```

Your rendered Markdown component will be accessible at
http://localhost:6161/markdown.

## Configuration options

### extension

Default `"md"`

The file extension associated with Markdown components.

### options

Default `undefined`

Options to be passed to the underlying `marked` package.

### handler

Default `undefined`

An alternative handler. The default handler renders the compiled Markdown as
HTML.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
