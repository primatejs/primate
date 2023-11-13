# HTMX

This handler module serves HTMX components with the `htmx` extension.

## Install

`npm install @primate/frontend htmx.org@1`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { htmx } from "@primate/frontend";

export default {
  modules: [
    htmx(),
  ],
};
```

## Use

Create an HTMX component in `components`.

```html caption=components/post-add.htmx
<h1>Add post</h1>
<form hx-post="/htmx" hx-wrap="outerHTML">
  <p>
    <div><label>Title</label></div>
    <input name="title" />
  </p>
  <p>
    <div><label>Text</label></div>
    <textarea name="text"></textarea>
  </p>
  <input type="submit" value="Save post" />
</form>
```

Create a route and serve the HTMX `post-add` component, adding a POST route for
handling its form.

```js caption=routes/htmx.js
import { view, html } from "primate";

const posts = [
export default {
  get() {
    return view("post-add.htmx");
  },
  post({ body }) {
    return html(
      `<h2>Adding a post with:</h2>
      <div><strong>Title</strong> ${body.get("title")}</div>
      <div><strong>Text</strong> ${body.get("text")}</div>`,
    { partial: true });
  },
};
```

Your rendered HTMX component will be accessible at http://localhost:6161/htmx.

Here, we used the `html` handler to return HTML directly from the POST route,
indicating it should not include the `app.html` layout by setting `partial`
to `true`. 

## Configuration options

### extension

Default `"htmx"`

The file extension associated with HTMX components.

### extensions

Default `[]`

HTMX [extensions] to load, as an array of strings denoting the extension name.

### client_side_templates

Default `[]`

Client side templates to be used by the [client-side-templates] extension.
Possible values: `"handlebars"`, `"mustache"` and `"nunjucks"`. Make sure you
add `"client-side-templates"` to the `extensions` array option.

## Resources

* [Repository][repo]

[repo]: https://github.com/primatejs/primate/tree/master/packages/frontend
[extensions]: https://htmx.org/extensions
[client-side-templates]: https://htmx.org/extensions/client-side-templates
