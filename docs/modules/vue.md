# Vue

This handler module supports SSR and serves Vue SFC components with the `.vue`
extension.

## Install

`npm i @primate/vue`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import vue from "@primate/vue";

export default {
  modules: [vue()],
};
```

## Use

Create a SFC component in `components`.

```html caption=components/PostIndex.vue
<template>
  <h1>All posts</h1>
  <div v-for="post in posts">
    <h2><a :href="`/vue/post/view/${post.id}`">{{post.title}}</a></h2>
  </div>
</template>
```

Create a route and serve the Vue `PostIndex` component.

```js caption=routes/vue.js
import {view} from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.vue", {posts});
  },
};
```

Your rendered Vue component will be accessible at http://localhost:6161/react.

## Configuration options

### directory

Default `config.paths.components`

Directory where the Vue SFC components reside.

## Resources

* [Repository][repo]

[rep]: https://github.com/primatejs/primate/tree/master/packages/vue
