<script lang="ts">
  interface Props {
    post: {
      id: string,
      title: string
    } 
  }

  const { post }: Post = $props();
</script>
<h2><a href="/svelte/post/{post.id}">{post.title}</a></h2>
