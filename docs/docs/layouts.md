# Layouts

!!!
Layouts are currently supported by the [Svelte], [Solid] and [React] handlers.
!!!

While you can change the default HTML page in `pages/app.html` or even create
and use other HTML pages in your handlers, those usually refer to the enclosing
HTML code around your application, concerned with the loading of scripts and
other assets, but not with the internal division of content itself.

At the same time, some areas of your app often consistently feature a header,
some with or without a sidebar or other recurring elements.

## Defining

Layouts are defined hierarchically alongside routes in the `routes`
directory. To define a layout, create a `+layout.js` file inside `routes`.

Similarly to the special guard files, a layout gets a  `request` parameter and
can respond with a proper handler -- usually `view`. Here is an example
of a layout rendering a Svelte component with its own data, distinct from that
of the route itself (`@primate/svelte` must be installed and loaded in the
project).

```js#+layout.js
import view from "primate/handler/view";

export default () => {
  return view("layout.svelte", { hello: "world" });
};
```

## Adding the component

The `view` handler loads the `layout.svelte` file from the `components`
directory, as it does with normal routes.

```svelte#components/layout.svelte
<script>
  export let data;
</script>
<div>
  This is a layout
  {data.hello}
  <slot></slot>
</div>
```

This layout does three things: it has its own text ("This is a layout"), prints
the contents of the `hello` data prop handed down to it from the layout
function, and includes anything (another layout, or the route's output itself)
by replacing `<slot></slot>` with it.

Unlike guards, which work top-down, layouts work bottom-up: they are included
in each other, with the innermost layout including the output of the route,
and being recursively included itself, up to the root layout.

[Svelte]: /modules/svelte
[Solid]: /modules/solid
[React]: /modules/react
