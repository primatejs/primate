# Frontend frameworks

Being a backend framework, Primate isn't tied to any specific frontend
framework. The core framework comes along with the [`html`][html] handler in
order to serve pure HTML directly from the route, and the [`view`][view]
handler to load `.html` files from the `components` directory. Additionally,
there are officially supported modules that cover popular frontend frameworks.
When loaded, they extend the `view` with support for additional file extensions.

Those frameworks come with different capabilities, like server-side rendering
(SRR), hydration and support for the [liveview](liveview) module, turning your 
application into a single-page application (SPA) after it has been initially
loaded. In some cases, some capabilities have simply not been implemented yet
in the module. In other cases, the frontend framework itself doesn't support
those.

## Server-side rendering (SSR)

This refers to the frontend framework compiling its files on the server and
sending prerendered HTML pages to the client. It avoids having the client
itself do the first render, which causes a delay in the time taken for a first
meaningful paint by the browser.

All official frontend modules aside from HTMX support SSR. HTMX itself has no
support for SSR.

## Hydration

Once a complete prerendered page has been sent to client, it is often necessary
to kick off the frontend framework on the client so it can register events and
manage the page. This is known as hydration.

Currently only the Svelte module supports hydration, while work on React and
Vue hydration is planned for future versions.

HTMX, having no SSR support, also has no support for hydration. The HTMX client
is *always* sent along the page and activates on page load.

## Liveview

The Primate [liveview](/modules/liveview) bridges the gap between SSR+hydration
and single page applications (SPA). It injects a small JavaScript client into 
the build, which uses `fetch` to manage clicking on links and submitting forms
instead of reloading the entire page, and also manages browsing the history.

Currently only the Svelte module supports liveview. The React and Vue modules
are expected to receive liveview support when hydration has been implemented
for them.

HTMX itself stands somewhat in competition to liveview, as it can register
handles to load links or send forms via `fetch`.

## Overview

Every frontend framework registers its own file extension with the
[`view`][view] handler and needs to be loaded in `primate.config.js`. You can
use different frontend frameworks alongside each other, in different routes.

|Name    |File Extension|Package          |[Layouts]|SSR|Hydration|[Liveview]|
|--------|--------------|-----------------|---------|---|---------|----------|
|HTML    |`.html`       |`primate`        |✗        |✗  |✗        |✗         |
|[Svelte]|`.svelte`     |`@primate/svelte`|✓        |✓  |✓        |✓         |
|[React] |`.jsx`        |`@primate/react` |✗        |✓  |✗        |✗         |
|[Vue]   |`.vue`        |`@primate/vue`   |✗        |✓  |✗        |✗         |
|[HTMX]  |`.htmx`       |`@primate/htmx`  |✗        |✗  |✗        |✗         |

[html]: /guide/responses#html
[view]: /guide/responses#view
[Svelte]: /modules/svelte
[React]: /modules/react
[Vue]: /modules/vue
[HTMX]: /modules/htmx
[Layouts]: /guide/layouts
[Liveview]: /modules/liveview
