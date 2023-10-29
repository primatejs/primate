<script>
  import Header from "./Header.svelte";

  export let content, app;
</script>
<Header {app} title="Expressive, minimal and extensible web framework" />
<main class="hero">
  <article>
    <img src="/logo.svg" />
    <h1>{app.title}</h1>
    <h2>{app.description}</h2>
    <div class="buttons">
      <a href="/guide/getting-started" class="primary">Read guide</a>
      <a href="https://github.com/primatejs/app" class="secondary">Template repo</a>
    </div>
  </article>
</main>
