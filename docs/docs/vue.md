# Vue

A progressive, incrementally-adoptable JavaScript framework for building UI on
the web.

## Support matrix

|Extension|Props|Server-side rendering|Hydration|Layouts|Head component|I18N|
|-|-|-|-|-|-|-|
|`.vue`|✓|✓|[✗]|[✗]|[✗]|[✗]|


## Install

```sh
npm install @primate/vue
```

## Init

```js#primate.config.js
import vue from "@primate/vue";

export default {
  modules: [
    vue(/* configuration */),
  ],
};
```

## Use

```vue#components/PostIndex.vue
<template>
  <h1>All posts</h1>
  <div v-for="post in posts">
    <h2><a :href="`/post/${post.id}`">{{post.title}}</a></h2>
  </div>
</template>
```

```js#routes/vue.js
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

## Configuration

### extension

Default `".vue"`

The file extension associated with Vue SFC components.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/vue
[✗]: https://github.com/primatejs/primate/issues/164
