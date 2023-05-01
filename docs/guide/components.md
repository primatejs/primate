# Components

Any views that your app has are placed in `components`. Primate natively
supports serving HTML files from this directory, and its official [framework
modules](/modules/frameworks) extend this support to other formats.

The components in this directory are served using the `view` handler. You also
have the option of serving HTML directly using the
[`html` handler](/guide/handling-requests#html).

## Serving views

To serve views, start by creating an HTML component in `components`.

```html file=components/hello.html
<p>Hello, world!</p>
```

Then serve it using the `view` handler, passing in the name of the HTML file
you just created.

```js file=routes/hello.js
import {view} from "primate";

export default {
  get() {
    return view("hello.html");
  }
}
```

The `view` handler will use the `static/index.html` if exists or otherwise a
fallback provided by Primate to render a full HTML page, replacing `%body%`
with the component's content.

```html file=static/index.html (default)
<!doctype html>
<html>
  <head>
    <title>Primate app</title>
    <meta charset="utf-8" />
    %head%
  </head>
  <body>%body%</body>
</html>
```

The combination of these files will result in the following HTML page served to
a client requesting `GET /hello`.

```html file=response body at GET /hello
<html>
  <head>
    <title>Primate app</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <p>Hello, world!</p>
  </body>
</html>
```

## Partials

It is sometimes necessary to serve a bare component without the `index.html`,
especially if you're replacing some parts of the page. To this end, you can use
the `partial` option of the `view` handler.

```js file=routes/partial-hello.js
import {view} from "primate";

export default {
  get() {
    return view("hello.html", {partial: true});
  }
}
```

Using the same `hello.html` component specified as above, a client requesting
`GET /partial-hello` will see the following response.

```html file=response body at GET /partial-hello
<p>Hello, world!</p>
```
