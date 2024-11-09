<script>
  export let sidebar, toc;
</script>

<nav class="sidebar">
<ul>
  {#each sidebar as line}
<li class={line.heading ? "heading" : ""}>
  {#if line.heading !== undefined}
    {line.heading}
  {:else}
    <a href={line.link} class={line.current ? "current": ""}>{line.title}</a>
    {#if line.current}
      <div class="toc">
      {#each toc as entry}
        <a href="#{entry.name}" class="level-{entry.level}">{entry.text}</a>
      {/each}
      </div>
    {/if}
  {/if}
</li>
{/each}
</ul>
</nav>
