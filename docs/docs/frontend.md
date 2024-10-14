# Intro

Primate supports a variety of frontend frameworks by adding a bit of glue code
around the frontend itself. Using the [`view`][view] handler, you can serve
frontend component files located in `components` directory from your routes.

Which features are supported differs between frontends. In some cases, the
feature has not been implemented yet for the frontend. In others, the frontend
itself doesn't support those. Refer to the individual documentation pages to 
see what each frontend supports.

## Extension

The file extension which the frontend registers its components with the `view`
handler.

## Props

Whether you can pass props from a route to the frontend components.

## SSR

Server-side rendering refers to the frontend compiling its files on the server
during buildtime and sending prerendered HTML pages to the client. It avoids
having the client do the initial rendering itself, which would otherwise cause
a delay in the time taken for a first contentful paint by the browser.

## Hydration

Once a complete prerendered page has been sent to client, it is often necessary
to kick off the frontend code on the client so it can register events and
manage the page. This is known as hydration.

## SPA

SPA browsing injects a small JavaScript client into the build which uses
`fetch` to manage clicking on links and submitting forms instead of reloading
the entire page, and also manages browsing the history.

## Layouts

Whether the frontend supports [recursive layouting][Layouts].

## Head

The ability to manipulate the `<head>` part from within an individual
component.

## Support matrix

|Frontend        |Extension      |Props|Layouts|SSR|Hydration|SPA|Head|I18N|
|----------------|---------------|-----|-------|---|---------|---|----|----|
|[Angular]       |`.component.ts`|✓    |✗      |✓  |✓        |✗  |✗   |✗   |
|[Eta]           |`.eta`         |✓    |✗      |✓  |✗        |✗  |✗   |✗   |
|[Handlebars]    |`.hbs`         |✓    |✗      |✓  |✓        |✗  |✗   |✗   |
|[HTML]          |`.html`        |✓    |✗      |✓  |✗        |✗  |✗   |✗   |
|[HTMX]          |`.htmx`        |✓    |✗      |✓  |✗        |✗  |✗   |✗   |
|[Markdown]      |`.md`          |✗    |✗      |✓  |✗        |✗  |✗   |✗   |
|[Marko]         |`.marko`       |✓    |✗      |✓  |✗        |✗  |✗   |✗   |
|[React]         |`.jsx`         |✓    |✓      |✓  |✓        |✓  |✓   |✓   |
|[Solid]         |`.jsx`         |✓    |✓      |✓  |✓        |✓  |✓   |✓   |
|[Svelte]        |`.svelte`      |✓    |✓      |✓  |✓        |✓  |✓   |✓   |
|[Voby]          |`.voby`        |✓    |✗      |✓  |✗        |✗  |✗   |✗   |
|[Vue]           |`.vue`         |✓    |✗      |✓  |✗        |✗  |✗   |✗   |
|[Web Components]|`.webc`        |✓    |✗      |✗  |✗        |✗  |✗   |✗   |

## Error list

### Missing Dependencies

Level [`Error`][error] | [`Bailout`][bailout]

A frontend module was loaded in the configuration for which dependencies are
missing.

*Install the dependency according to the instructions in the error message.*

The frontend module only provides wrappers for frontend frameworks. The actual
package needs to be installed by the user. Primate will inform you which
dependency is missing and what command you need to issue to install it.

[view]: /docs/responses#view
[Layouts]: /docs/layouts
[I18N]: /docs/i18n
[bailout]: /docs/logging#bailout
[error]: /docs/logging#error
[Angular]: /docs/angular
[Eta]: /docs/eta
[Handlebars]: /docs/handlebars
[HTML]: /docs/html
[HTMX]: /docs/htmx
[Markdown]: /docs/markdown
[Marko]: /docs/marko
[React]: /docs/react
[Solid]: /docs/solid
[Svelte]: /docs/svelte
[Voby]: /docs/voby
[Vue]: /docs/vue
[Web Components]: /docs/web-components
