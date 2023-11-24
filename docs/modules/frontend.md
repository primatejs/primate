# Frontends

Primate isn't tied to any specific frontend framework. The core platform comes 
along with a [`view`][view] handler that serves `html` files from the 
`components` directory. Additionally there are officially supported modules that
cover many frontend frameworks. When loaded, they extend the `view` handler
to support more file extensions.

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
itself do the first rendering, which would otherwise cause a delay in the time 
taken for a first meaningful paint by the browser.

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

The [liveview](/modules/liveview) module bridges the gap between SSR/hydration
and single page applications (SPA). It injects a small JavaScript client into 
the build which uses `fetch` to manage clicking on links and submitting forms
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

## Support matrix

Every frontend framework registers its own file extension with the
[`view`][view] handler and needs to be loaded in `primate.config.js`. You can
use different frontend frameworks alongside each other, in different routes.

|          |HTML   |[Svelte]       |[React] |[Solid] |[Vue] |[HTMX] |[Handlebars]|
|----------|-------|---------------|--------|--------|------|-------|------------|
|Extension |`.html`|`.svelte`      |`.jsx`  |`.jsx`  |`.vue`|`.htmx`|`.hbs`      |
|[Layouts] |✗      |✓              |✓       |✓       |✗     |✗      |✗           | 
|SSR       |✗      |✓              |✓       |✓       |✓     |✗      |✓           | 
|Hydration |✗      |✓              |✓       |✓       |✗     |✗      |✗           |
|[Liveview]|✗      |✓              |✓       |✓       |✗     |✗      |✗           |
|Head      |✗      |`<svelte:head>`|`<Head>`|`<Head>`|✗     |✗      |✗           |
|[I18N]    |✗      |✓              |✓       |✓       |✗     |✗      |✗           |

## Error list

### Missing Dependencies

Level [`Error`][error] | [`Bailout`][bailout]

A frontend module was loaded in the configuration for which dependencies are
missing.

*Install the dependency according to the instructions in the error message.*

The frontend module only provides wrappers for frontend frameworks. The actual
package needs to be installed by the user. Primate will inform you which
dependency is missing and what command you need to issue to install it.

[view]: /guide/responses#view
[Svelte]: /modules/svelte
[React]: /modules/react
[Solid]: /modules/solid
[Vue]: /modules/vue
[HTMX]: /modules/htmx
[Handlebars]: /modules/handlebars
[Layouts]: /guide/layouts
[Liveview]: /modules/liveview
[I18N]: /modules/i18n
[bailout]: /guide/logging#bailout
[error]: /guide/logging#error
