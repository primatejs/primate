# Voby

A high-performance framework with fine-grained observable-based reactivity for
building rich applications.

## Support matrix

|Extension|Props|Server-side rendering|Hydration|Layouts|Head component|I18N|
|-|-|-|-|-|-|-|
|`.voby`|✓|✓|[✗]|[✗]|[✗]|[✗]|

## Install

```sh
npm install @primate/voby
```

## Configure

```js caption=primate.config.js
import voby from "@primate/voby";

export default {
  modules: [
    voby(/* configuration */),
  ],
};
```

## Use

```jsx caption=components/PostIndex.voby
export default props => <>
  <h1>All posts</h1>
  {props.posts.map(({ id, title}) =>
    <h2><a href={`/post/view/${id}`}>{title}</a></h2>)}
</>;
```

```js caption=routes/voby.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.voby", { posts });
  },
};
```

## Configuration

### extension

Default `".voby"`

The file extension associated with Voby components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/voby
[✗]: https://github.com/primatejs/primate/issues/164
