<script>
  import {onMount} from "svelte";

  import Icons from "./Icons.svelte";
  import Icon from "./Icon.svelte";

  let highlight = _ => "";
  let colorscheme;

  const part = link => link.split("/")[1];

  onMount(async () => {
    colorscheme = (await import("./localStorage.js")).default;
    highlight = link =>
      part(link) === part(document.location.pathname) ? "active" : "";
  });

  export let app, title;
  const {theme} = app;

  const toggleColorScheme = () =>
    colorscheme.update(value => value === "dark" ? "light" : "dark");
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

    <a class="ic" href="https://reddit.com/{theme.reddit}">
      <Icon name="reddit" />
    </a>

    <a class="ic" href="https://github.com/{theme.github}">
      <Icon name="github" />
    </a>
  </ul>

</header>
