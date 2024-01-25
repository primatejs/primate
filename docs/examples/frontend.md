%%% React, Svelte, Vue, Solid

```jsx caption=components/Index.jsx
export default ({ posts }) => {
  return (<>
    <h1>All posts</h1>
    {posts.map((post) => (
      <h2 key={post.id}>
        <a href={`/post/${post.id}`}>
          {post.title}
        </a>
      </h2>
    ))}
  </>);
}
```

```html caption=components/Index.svelte
<script>
  export let posts;
</script>
<h1>All posts</h1>
{#each posts as { id, title }}
  <h2>
    <a href="/post/{id}">
      {title}
    </a>
  </h2>
{/each}
```

```html caption=components/Index.vue
<template>
  <h1>All posts</h1>
  <div v-for="post in posts">
    <h2>
      <a :href="`/post/${post.id}`">
        {{post.title}}
      </a>
    </h2>
  </div>
</template>
```

```jsx caption=components/Index.jsx
import { For } from "solid-js/web";

export default ({ posts }) => {
  return <>
    <h1>All posts</h1>
    <For each={posts}>{post =>
      <h2>
        <a href={`/post/${post.id}`}>
          {post.title}
        </a>
      </h2>
    }</For>
  </>;
}
```

%%%
