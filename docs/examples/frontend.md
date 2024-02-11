%%% React, Svelte, Vue, Solid, Angular, WebC

```jsx caption=components/PostIndex.jsx
export default ({ posts }) => {
  return (<>
    <h1>All posts</h1>
    {posts.map(post => (
      <h2 key={post.id}>
        <a href={`/post/${post.id}`}>
          {post.title}
        </a>
      </h2>
    ))}
  </>);
};
```

```svelte caption=components/PostIndex.svelte
<script>
  export let posts;
</script>
<h1>All posts</h1>
{#each posts as post}
  <h2>
    <a href="/post/{post.id}">
      {post.title}
    </a>
  </h2>
{/each}
```

```vue caption=components/PostIndex.vue
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

```jsx caption=components/PostIndex.jsx
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
};
```

```angular-ts caption=components/post-index.component.ts
import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "post-index",
  imports: [CommonModule],
  template: `
    <h1>All posts</h1>
    <div *ngFor="let post of posts">
      <h2>
        <a href="/post/view/{{post.id}}">
          {{post.title}}
        </a>
      </h2>
    </div>
  `,
  standalone: true,
})
export default class PostIndex {
  @Input() posts = [];
}
```

```html caption=components/post-index.webc
<script>
import { Component } from "@primate/frontend/webc";

export default class extends Component {
  render() {
    const { posts } = this.props;

    return `<h1>All posts</h1>
      ${posts.map(post => `
        <h2>
          <a href="/post/view/${post.id}">
            ${post.title}
          </a>
        </h2>
      `).join("")}
    `;
  },
};
</script>
```

%%%
