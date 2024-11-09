# Markdown

Markdown is a markup language for documentation.

## Features

|File Extension|Props|SSR|Hydration|SPA|Layouts|Head|I18N|
|-|-|-|-|-|-|-|-|
|`.md`|✗|✓|-|-|-|-|-|

## Install

{% install=@primate/markdown %}

## Use

{% tabs %}

```js#primate.config.js
import markdown from "@primate/markdown";

export default {
  modules: [
    markdown(/* MarkdownOptions */),
  ],
};
```

```js#Route
import view from "primate/handler/view";

export default {
  get() {
    return view("PostIndex.md");
  },
};
```

```md#Component
# Posts

## Post1

This is the **first** post
```

{% /tabs %}

## Options

```ts
interface MarkdownOptions {
  fileExtension?: string,
  // Options to be passed to the underlying `marked` package
  options?: {},
  // An alternative renderer. The default renderer renders the compiled
  // Markdown as HTML
  renderer?: (...rest: unknown[]) => Response,
}
```

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/markdown
