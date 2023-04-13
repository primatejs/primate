# Primate Vue module

## Install

`npm i @primate/vue`

## Configure

Add to `primate.config.js`

```js
import vue from "@primate/vue";

export default {
  modules: [vue()],
};
```

## Use

Create a [SFC][sfc] component in `components`, e.g. `PostIndex.vue`.

```vue
<template>
  <h1>All posts</h1>
  <div v-for="post in posts">
    <h2><a :href="`/vue/post/view/${post.id}`">{{post.title}}</a></h2>
  </div>
</template>
```

Create a route, for example in `routes/vue.js` (mapping `/vue`).

```js
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
