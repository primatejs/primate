%%% React, Svelte, Vue, Solid, Angular, WebC

```jsx caption=components/Index.jsx
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
}
```

```html caption=components/Index.svelte
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

```ts caption=components/index.component.ts
import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "index",
  imports: [ CommonModule ],
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
export default class Index {
  @Input() posts = [];
}
```

```html caption=components/index.webc
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
  }
}
</script>
```

%%%
