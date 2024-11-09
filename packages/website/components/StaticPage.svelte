<script>
  import { onMount } from "svelte";

  import Header from "./Header.svelte";
  import Sidebar from "./Sidebar.svelte";
  import OnThisPage from "./OnThisPage.svelte";

  export let content, toc, app, sidebar, page;

  const [{ text: title }] = toc;
  onMount(() => {
    globalThis.document.querySelectorAll(".tabbed").forEach(tabbed => {
      const captions = tabbed.querySelector(".captions").childNodes;
      const tabs = tabbed.querySelector(".tabs").childNodes;
      captions.forEach((caption, i) => {
        caption.addEventListener("click", () => {
          captions.forEach((_caption, j)  => {
            if (i === j) {
              _caption.classList.add("active");
            } else {
              _caption.classList.remove("active");
            }
          });
          tabs.forEach((tab, j)  => {
            if (i === j) {
              tab.classList.remove("hidden");
            } else {
              tab.classList.add("hidden");
            }
          });
        });
      });
    });
  });
</script>
<Header {app} {title} />
<main>
{#if sidebar !== undefined}
  <Sidebar {sidebar} {toc} />
{/if}
<article>
  {@html content}
  <div class="controls">
    <span class="prev">
      {#if page.previous !== undefined}
        <div class="heading">Previous</div>
        <a href="{page.previous.link}">{page.previous.title}</a>
      {/if}
    </span>
    <span class="next">
      {#if page.next !== undefined}
        <div class="heading">Next</div>
        <a href="{page.next.link}">{page.next.title}</a>
      {/if}
    </span>
  </div>
</article>
</main>
