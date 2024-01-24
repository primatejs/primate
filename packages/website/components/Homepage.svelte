<script>
  import { onMount } from "svelte";
  import Header from "./Header.svelte";

  const modify_route = ending => {
    const strings = document.querySelector(".tabs")
      .querySelectorAll(".hljs-string");
    [...strings]
      .filter(string => string.innerText.startsWith("\"Index."))
      .forEach(string => {
        string.innerText = `"Index.${ending}"`;
      });
  };

  onMount(() => {
    document.querySelectorAll(".tabbed").forEach(tabbed => {
      const captions = tabbed.querySelector(".captions").childNodes;
      const tabs = tabbed.querySelector(".tabs").childNodes;
      captions.forEach((caption, i) => {
        caption.addEventListener("click", () => {
          const text = caption.innerText.toLowerCase();
          if (text === "react" || text === "solid") {
            modify_route("jsx");
          }
          if (text === "svelte") {
            modify_route("svelte");
          }
          if (text === "vue") {
            modify_route("vue");
          }
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

  export let content, app, examples;

  const { theme } = app;
</script>
<Header {app} title="Polymorphic development platform" />
<main class="hero">
  <div class="header">
    <div>
      <img src="/logo.svg" style="width: 46px;" />
    </div>
    <div>
      <h1>primate</h1>
      <h2 class="heading">polymorphic development platform</h2>
      <div class="buttons">
        <a href="/guide/getting-started" class="primary">read guide</a>
        <a href="" class="secondary">$ npm create primate@latest</a>
      </div>
    </div>
  </div>
  <div class="table">
    <div>
      <h1>backend</h1>
      <div class="logos">
        <img src="/logos/js.png" title="JavaScript" />
        <img src="/logos/go.svg" title="Golang" />
        <img src="/logos/python.svg" title="Python" />
      </div>
      <p>
        Write backend code in your language of choice, leveraging the power of
        Wasm. Mix routes of <a href="/modules/binding">different backend languages, allowing sections of
        your app to be written by different teams.
      </p>
      {@html examples.backend}
    </div>
    <div>
      <h1>frontend</h1>
      <div class="logos">
        <img src="/logos/react.svg" title="React" />
        <img src="/logos/svelte.svg" title="Svelte" />
        <img src="/logos/vue.svg" title="Vue" />
        <img src="/logos/solid.svg" title="Solid" />
      </div>
      <p>
        Seamlessly switch between frontend frameworks, with support for SSR, 
        hydration and layouts across the board. You can even combine more than
        one framework in your app.
      </p>
      {@html examples.frontend}
    </div>
    <div>
      <h1>runtime</h1>
      <div class="logos">
        <img src="/logos/node.png" title="Node.js" />
        <img src="/logos/deno.svg" title="Deno" class="invertible" />
        <img src="/logos/bun.png" title="Bun" />
      </div>
      <p>
        Compare the performance of your app across different JavaScript
        runtimes. Use the comfort of one runtime during development and the
        speed gains of another in production.
      </p>
      {@html examples.runtime}
    </div>
  </div>
  <h1 class="interim-title">EXTENSIVE ECOSYSTEM</h1>
  <div class="table">
    <div>
      <h1>data handling</h1>
      <div class="logos">
        <img src="/logos/sqlite.svg" title="SQLite" />
        <img src="/logos/postgresql.svg" title="PostgreSQL" />
        <img src="/logos/mongodb.svg" title="MongoDB" />
        <img src="/logos/surrealdb.svg" title="SurrealDB" />
      </div>
      <p>Validate input using Primate's <a href="/modules/types">runtime types</a>. 
        Persist information with <a href="/modules/store">stores</a>, 
        using any of the supported <a href="/modules/drivers">database drivers</a>
        with a unified ORM interface, or write your own optimized, low-level 
        store actions. Primate's ORM comes with automated transaction management and
        rollback on error, saving you writing boilerplate code in your 
        application routes.
      </p>
    </div>
    <div>
      <h1>internationalization</h1>
      <div class="logos">
        <img src="/logos/react.svg" title="React" />
        <img src="/logos/svelte.svg" title="Svelte" />
        <img src="/logos/solid.svg" title="Solid" />
      </div>
      <p>Easily make your app international, using a unified API across 
      different frontends.</p>
      {@html examples.i18n}
    </div>
    <div>
      <h1>all around</h1>
      <div class="logos">
        <img src="/logos/esbuild.svg" title="esbuild" />
      </div>
      <p>Use <a href="/modules/build">esbuild</a> for hot reload during devlopment and bundling in
        production, add <a href="/modules/session">user sessions</a>, <a
          href="/modules/websocket">web
          sockets</a>, and <a href="/modules/liveview">liveview browsing</a>, or
        <a href="/guide/extending-primate">write your own modules</a> using the available hooks.
      </p>
    </div>
  </div>
  <div class="footer">
    <div class="table">
      <div>
        <img src="/logo.svg" />
      </div>
      <div>
        <div class="heading">docs</div>
        <ul>
          <li><a href="/guide">guide</a></li>
          <li><a href="/modules">modules</a></li>
          <li><a href="/blog">blog</a></li>
        </ul>
      </div>
      <div>
        <div class="heading">community</div>
        <ul>
          <li><a href="{theme.chat}">irc</a></li>
          <li><a href="https://x.com/{theme.x}">x</a></li>
          <li><a href="https://reddit.com/{theme.reddit}">reddit</a></li>
          <li><a href="https://github.com/{theme.github}">github</a></li>
        </ul>
      </div>
    </div>
  </div>
</main>
