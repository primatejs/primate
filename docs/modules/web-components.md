# Web Components

This handler module serves web components with the `.webc` extension.

## Install

`npm install @primate/frontend`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { webc } from "@primate/frontend";

export default {
  modules: [
    webc(),
  ],
};
```

## Use

Create an web component in `components`.

```html caption=components/post-index.webc
<script>
  import post_link from "./post-link.webc";

  export default ({posts}) => `
    <h1>All posts</h1>
    ${posts.map(post => post_link({post}))}
  `;

  export const mounted = root => {
    root.querySelector("h1").addEventListener("click", 
      _ => console.log("title clicked!"));
  };
</script>
```

And another component for display post links.

```html caption=components/post-link.webc
<script>
  export default ({post}) => `
    <h2><a href="/post/view/${post.id}">${post.title}</a></h2>
  `;
</script>
```

Create a route and serve the `post-index` component.

```js caption=routes/webc.js
import { view } from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("post-index.webc", { posts });
  },
};
```

Your rendered web component will be accessible at http://localhost:6161/webc.

## Configuration options

### extension

Default `".webc"`

The file extension associated with web components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
