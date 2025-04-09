<script>
  import t from "@primate/svelte/i18n";

  export let post;
</script>
<h1>{$t("Title")}: {post.title}</h1>

<div>Id: {post.id}</div>
