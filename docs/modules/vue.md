# Vue handler

The [Vue handler module][repository] supports SSR and serves Vue SFC components
with the `.vue` extension.

## Install

`npm i @primate/vue`

## Load

Import and initialize the module in your configuration.

```js file=primate.config.js
import vue from "@primate/vue";

export default {
  modules: [vue()],
};
```

## Use

Create a SFC component in `components`.

```html file=components/PostIndex.vue
<template>
  <h1>All posts</h1>
  <div v-for="post in posts">
    <h2><a :href="`/vue/post/view/${post.id}`">{{post.title}}</a></h2>
  </div>
</template>
```

Create a route and serve the Vue `PostIndex` component.

```js file=routes/vue.js
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

[repository]: https://github.com/primatejs/primate/tree/master/packages/vue
