<script>
  import Header from "./Header.svelte";
  import OnThisPage from "./OnThisPage.svelte";

  const format = {"day": "2-digit", "month": "short", "year": "numeric"};
  const date = epoch => new Date(epoch).toLocaleDateString("en-AU", format);

  export let content, toc, app, meta;

  const {author, epoch, title} = meta;

</script>
<Header {app} {title} />
<main>
  <article class="blog">
  <h1>{title}</h1>
  <div class="blog-metadata">
    <svg class="icon" width="16" height="16">
      <use xlink:href="#calendar" />
    </svg>
    {date(epoch)} by 
    <a class="author" href="https://github.com/{author}">{author}</a>
  </div>
{@html content}
</article>
<OnThisPage {toc}/>
</main>
