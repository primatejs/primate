# React

A library for web and native user interfaces.

## Support matrix

|Extension|Props|SSR|Hydration|Layouts|Head|I18N|
|-|-|-|-|-|-|-|
|`.jsx`|✓|✓|✓|✓|`@primate/react/head`|`@primate/i18n/react`|

## Install

```sh
npm install @primate/react
```

## Init

```js caption=primate.config.js
import react from "@primate/react";

export default {
  modules: [
    react(/* configuration */),
  ],
};
```

## Use

```jsx caption=components/PostIndex.jsx
export default props => <>
  <h1>All posts</h1>
  { props.posts.map(({ id, title }) => (
    <h2><a href={`/post/${id}`}>{title}</a></h2>
  )) }
</>;
```

```js caption=routes/react.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.jsx", { posts });
  },
};
```

## Configuration

### extension

Default `".jsx"`

The file extension associated with React JSX components.

To use TSX instead of JSX files, change this value to `".tsx"`.

### spa

Default `true`

Whether single-page app browsing using `fetch` should be active.

Disabling this property will trigger a complete page load on every link click
and form submission, the standard browser behavior.

### ssr

Default `true`

Whether server-side rendering should be active.

Disabling this property will not prerender components on the server.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/react
