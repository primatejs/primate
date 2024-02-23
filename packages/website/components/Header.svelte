<script>
  import { onMount } from "svelte";
  import Icons from "./Icons.svelte";
  import Icon from "./Icon.svelte";

  export let app, title;

  const {theme} = app;
  const part = link => link.split("/")[1];
  const toggleColorScheme = () =>
    colorscheme.update(value => value === "dark" ? "light" : "dark");

  let highlight = _ => "";
  let colorscheme;

  onMount(async () => {
    colorscheme = (await import("./localStorage.js")).default;
    highlight = link =>
      part(link) === part(globalThis.window.location.pathname) ? "active" : "";
  });
</script>
<svelte:head>
  <title>Primate - {title}</title>
</svelte:head>
<Icons />
<header>
  <a class="home" href="/">
    <img src="/logo.svg" />
  </a>

  <div class="search"></div>

  <ul class="navbar">
    {#each theme.navbar as {link, label}}
    <li>
      <a href="{link}" class="{highlight(link)}">{label}</a>
    </li>
    {/each}

    <div class="divider" />

    <button class="ic" on:click={toggleColorScheme}>
      <Icon name={$colorscheme === "dark" ? "sun" : "moon"} />
    </button>

    <a class="ic" href="{theme.chat}">
      <Icon name="chat" />
    </a>

    <a class="ic" href="https://x.com/{theme.x}">
      <Icon name="x" />
    </a>

    <a class="ic" href="https://github.com/{theme.github}">
      <Icon name="github" />
    </a>
  </ul>

</header>
