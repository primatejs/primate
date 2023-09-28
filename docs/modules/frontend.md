# Frontend frameworks

Being a backend framework, Primate isn't tied to any specific frontend
framework. The core framework comes along with the [`view`][view] handler that
loads `html` files from the `components` directory. Additionally, there are
officially supported modules that cover popular frontend frameworks. When
loaded, they extend the `view` with support for additional file extensions.

Those frameworks come with different capabilities, like server-side rendering
(SSR), hydration and support for the [liveview](liveview) module, turning your 
application into a single-page application (SPA) after it has been initially
loaded. In some cases, some capabilities have simply not been implemented yet
in the module. In other cases, the frontend framework itself doesn't support
those.

## Layouts

Svelte, React and Solid currently support [recursive layouting][Layouts] in
Primate.

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

Currently the Svelte, React and Solid modules support hydration, while work on
Vue hydration is planned for future versions.

HTMX, having no SSR support, also has no support for hydration. The HTMX client
is *always* sent along the page and activates on page load.

## Liveview

The Primate [liveview](/modules/liveview) bridges the gap between SSR/hydration
and single page applications (SPA). It injects a small JavaScript client into 
the build, which uses `fetch` to manage clicking on links and submitting forms
instead of reloading the entire page, and also manages browsing the history.

Currently the Svelte, React and Solid modules support liveview. The Vue module
is expected to receive liveview support when hydration has been implemented for
it.

HTMX itself stands somewhat in competition to liveview, as it can register
handles to load links or send forms via `fetch`.

## Head component

If you need to manipulate the `<head>` part from within an individual
component, use `<svelte:head>` for Svelte. For React and Solid, you can use the
`Head` export of `@primate/frontend/react` and `@primate/frontend/solid` for
the same behavior.

## Overview

Every frontend framework registers its own file extension with the
[`view`][view] handler and needs to be loaded in `primate.config.js`. You can
use different frontend frameworks alongside each other, in different routes.

|Name         |Extension   |[Layouts]|SSR|Hydration|[Liveview]|Head           |
|-------------|------------|---------|---|---------|----------|---------------|
|HTML         |`html`      |✗        |✗  |✗        |✗         |✗              |
|[Svelte]     |`svelte`    |✓        |✓  |✓        |✓         |`<svelte:head>`|
|[React]      |`jsx`       |✓        |✓  |✓        |✓         |`<Head>`       |
|[Solid]      |`jsx`       |✓        |✓  |✓        |✓         |`<Head>`       |
|[Vue]        |`vue`       |✗        |✓  |✗        |✗         |✗              |
|[HTMX]       |`htmx`      |✗        |✗  |✗        |✗         |✗              |
|[Handlebars] |`handlebars`|✗        |✓  |✗        |✗         |✗              |

[view]: /guide/responses#view
[Svelte]: /modules/svelte
[React]: /modules/react
[Solid]: /modules/solid
[Vue]: /modules/vue
[HTMX]: /modules/htmx
[Handlebars]: /modules/handlebars
[Layouts]: /guide/layouts
[Liveview]: /modules/liveview
