# Vue

This handler module supports SSR and serves Vue SFC components with the `.vue`
extension.

## Install

`npm install @primate/vue`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import vue from "@primate/vue";

export default {
  modules: [
    vue(),
  ],
};
```

## Use

Create a SFC component in `components`.

```vue caption=components/PostIndex.vue
<template>
  <h1>All posts</h1>
  <div v-for="post in posts">
    <h2><a :href="`/post/${post.id}`">{{post.title}}</a></h2>
  </div>
</template>
```

Serve it from a route.

```js caption=routes/vue.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.vue", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/react.

## Configuration options

### extension

Default `".vue"`

The file extension associated with Vue SFC components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primate-run/primate/tree/master/packages/vue
