<script>
  import t from "@primate/svelte/i18n";
  import locale from "@primate/svelte/locale";
  import PostLink from "./PostLink.svelte";

  export let posts = [], title = "";
  let count = 0;
</script>
<svelte:head>
  <title>Primate template app (Svelte)</title>
  <meta name="keywords" content={title} />
</svelte:head>
<a href="/svelte-redirect">redirect</a>
<h1 on:click={() => { console.log("clicked!"); }}>{$t("All posts")}</h1>
{#each posts as post}
<PostLink {post} />
{/each}
<h3>{$t("Counter")}</h3>
<div>
<button on:click={() => { count = count - 1; }}>-</button>
<button on:click={() => { count = count + 1; }}>+</button>
{count}
</div>
<h3>{$t("Switch language")}</h3>
<div><a on:click={() => locale.set("en-US")}>{$t("English")}</a></div>
<div><a on:click={() => locale.set("de-DE")}>{$t("German")}</a></div>
