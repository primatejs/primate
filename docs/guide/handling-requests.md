# Handling requests

Every route function represents an HTTP verb that receives a request and
returns a response.

Depending on the type of content returned from a route, Primate will guess a
content type for you automatically. This applies to strings, objects, readable
streams and `URL` objects. For other cases, Primate offers explicit handlers
that you can use.

In the following examples we'll use route functions mapped to different paths
by placing them in the `routes` directory. Unless otherwise noted, all the
following requests reply with a `200 OK` response.

## Plain text

Strings are served with the content type `text/plain`.

```js file=routes/plain-text.js
export default {
  get() {
    return "Donald";
  },
};
```

This route function handles GET requests to the path `/plain-text` by serving
them the string "Donald" in plain text.

To use this handler explicitly, import and use the `text` function.

```js file=routes/plain-text.js
import {text} from "primate";

export default {
  get() {
    return text("Donald", {status: 201});
  },
};
```

Using the explicit handler you can also override the status code of the
response.

### JSON

Objects (including arrays) are served with the content type
`application/json`.

```js file=routes/json.js
export default {
  get() {
    return [
      {name: "Donald"},
      {name: "Ryan"},
    ];
  },
};
```

This route function handles GET requests to the path `/json` by serving them a
JSON array.

Like `text`, this handler can also be used explicitly with the `json` import.

### Stream

Instances of `ReadableStream` or `Blob` are streamed to the client with the
content type `application/octet-stream`.

```js file=routes/stream.js
import {File} from "runtime-compat/fs";

export default {
  get() {
    return new File("/tmp/users.json");
  },
};
```

This route function handles GET requests to the path `/stream` by streaming
them the contents of the file at `/tmp/users.json`.

!!!
We used here the `File` class from the `runtime-compat/fs` module, which
subclasses `Blob`.
!!!

This handler can be also used explicitly with the `stream` import.

### Redirect

Instances of `URL` redirect the client to the location they represent using the
status code `302 Found`.

```js file=routes/redirect.js
import {URL} from "primate";

export default {
  get() {
    return new URL("https://primatejs.com");
  },
};
```

This route function handles GET requests to the path `/redirect` by sending
them to the given URL.

!!!
We here used Primate's `URL` export, which guarantees [cross-runtime
compatibility](/guide/compatibility). In Node's case, it simply mirrors `globalThis.URL`.
!!!

As `URL` objects can only be used with fully-qualified domains, it is often
easier to use the explicit `redirect` handler to redirect to paths within the
same app.

```js file=routes/redirect.js
import {redirect} from "primate";

export default {
  get() {
    return redirect("/success", {status: 301});
  },
};
```

This also allows you to use a custom response code alongside the redirect for
fine-grained control.

### HTML

The `html` handler allows you to serve responses with content type `text/html`
directly from the route function.

```js file=routes/html.js
import {html} from "primate";

export default {
  get() {
    return html("<p>Hello, world!</p>");
  },
};
```

In this case, Primate will inject the HTML code passed to the handler into the
index file located at `static/index.html` and serve the resulting file at the
path GET `/html`. In case no such file exists, Primate will fall back to its
[default index.html][default-index].

The `html` handler also supports partial responses, without embedding it into
`index.html`, by setting the `partial` flag to `true`. Like with every other
explicit handler, you can also change the status code.

```js file=routes/html.js
import {html} from "primate";

export default {
  get() {
    return html("<p>Hello, world!</p>", {partial: true, status: 201});
  },
};
```

### View

The `view` handler allows you to serve responses with content type `text/html`
from the `components` directory.

```js file=routes/view.js
import {view} from "primate";

export default {
  get() {
    return view("hello.html");
  },
};
```

In this case, Primate will load the HTML component at `components/hello.html`.

```html file=components/hello.html
<p>Hello, world!</p>
```

Similarly to the `html`, Primate will embed the content of the component into
`index.html`, either your custom one or its default.

### Error

The `error` handler allows you to generate an error (typically with a 4xx or
5xx status code). The most common error and the default of this handler is
`404 Not Found` using the content type `text/html`.

```js file=routes/error.js
import {error} from "primate";

export default {
  get() {
    return error();
  },
};
```

A request to `/error` will result in a `404 Not Found` response.

You can customize the body and the status of this handler.

```js file=routes/server-error.js
import {error} from "primate";

export default {
  get() {
    return error("Internal Server Error", {status: 500});
  },
};
```

A request to `/server-error` will result in a `500` response with the HTML body
`Internal Server Error`.

### Custom response

Lastly, for a custom response status, you can return a `Response` object from a
route.

```js file=routes/response.js
import {Response} from "primate";

export default {
  get() {
    return new Response("created!", {status: 201});
  },
};
```

This route function will handle requests to the path `/response`.

This isn't actually a handler, but what all handlers eventually become, a
WHATWG [`Response`][whatwg-response] object.

[default-index]:
https://github.com/primatejs/primate/blob/master/packages/primate/src/defaults/index.html
[whatwg-response]: https://fetch.spec.whatwg.org/#response-class
