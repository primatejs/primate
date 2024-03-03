# Responses

Every route function represents an HTTP verb that accepts a request and returns
a response.

Depending on the type of content returned from a route, Primate will guess a
content type for you automatically. This applies to strings, objects, readable
streams and `URL` objects. For other cases, Primate offers explicit handlers
that you can use.

In the following examples we'll use route functions mapped to different paths
by placing them in the `routes` directory. Unless otherwise noted, all the
following requests reply with a `200 OK` response.

## Plain text

Strings are served with the content type `text/plain`.

```js caption=routes/plain-text.js
export default {
  get() {
    return "Donald";
  },
};
```

This route function handles GET requests to the path `/plain-text` by serving
them the string "Donald" in plain text.

To use this handler explicitly, import and use the `text` function.

```js caption=routes/plain-text.js
import { text, Status } from "primate";

export default {
  post(request) {
    const { name } = request.body;

    if (name === undefined) {
      return text("No name specified", { status: Status.UNPROCESSABLE_ENTITY });
    }

    return text("Name submitted successfully", { status: Status.CREATED });
  },
};
```

Using the explicit handler you can also override the status code of the
response. Here the route function handles POST request and the default `200 OK`
response code is overriden by `201 Created` for a valid name entry or
`422 Unprocessable Entity` for an undefined name.

## JSON

Objects (including arrays) are served with the content type `application/json`.

```js caption=routes/json.js
export default {
  get() {
    return [
      { name: "Donald" },
      { name: "Ryan" },
    ];
  },
};
```

This route function handles GET requests to the path `/json` by serving them a
JSON array.

Like `text`, this handler can also be used explicitly with the `json` import.

## Stream

Instances of `ReadableStream` or `Blob` are streamed to the client with the
content type `application/octet-stream`.

```js caption=routes/stream.js
import { File } from "rcompat/fs";

export default {
  get() {
    return File.stream("/tmp/users.json");
  },
};
```

This route function handles GET requests to the path `/stream` by streaming
them the contents of the file at `/tmp/users.json`.

!!!
We used here the `File.stream` function from the `rcompat/fs` module, which
exposes a `ReadableStream`.
!!!

This handler can be also used explicitly with the `stream` import.

## Redirect

Instances of `URL` redirect the client to the location they represent using the
status code `302 Found`.

```js caption=routes/redirect.js
import { URL } from "primate";

export default {
  get() {
    return new URL("https://primatejs.com");
  },
};
```

This route function handles GET requests to the path `/redirect` by sending
them to the given URL.

!!!
We here used Primate's `URL` export, which guarantees cross-runtime
compatibility. In Node's case, it simply mirrors `globalThis.URL`.
!!!

As `URL` objects can only be used with fully-qualified domains, it is often
easier to use the explicit `redirect` handler to redirect to paths within the
same app.

```js caption=routes/redirect.js
import { redirect, Status } from "primate";

export default {
  get() {
    return redirect("/success", { status: Status.MOVED_PERMANENTLY });
  },
};
```

This also allows you to use a custom response code alongside the redirect for
fine-grained control.

## View

The `view` handler allows you to serve responses with content type `text/html`
from the `components` directory.

```js caption=routes/view.js
import { view } from "primate";

export default {
  get() {
    return view("hello.html");
  },
};
```

In this case, Primate will load the HTML component at `components/hello.html`,
inject the HTML component code into the index file located at `pages/app.html`
and serve the resulting file at the path GET `/html`. In case no such file
exists, Primate will fall back to its [default index page][default-page].

```html caption=components/hello.html
<p>Hello, world!</p>
```

In addition to the built-in support for HTML components, Primate features many
[frontend frameworks][frontend] you can add by installing the
`@primate/frontend` module.

### Props

You can pass props to your view handler.

```js caption=routes/view-props.js
import { view } from "primate";

export default {
  get() {
    return view("hello.html", { hello: "world" });
  },
};
```

In the case of HTML, use template syntax to access the props in your component.

```html caption=components/hello.html
<p>Hello, ${hello}!</p>
```

For other frontend frameworks, Primate uses the standard mechanism to access
props within the component.

### Options

You can customize different aspects of the view handler by passing in options.

#### page

To use a different HTML page to embed your component instead of [the
default][default-page], pass in a differing `page` string property.

```js caption=routes/view-page.js
import { view } from "primate";

export default {
  get() {
    return view("hello.html", { hello: "world" }, { page: "other.html" });
  },
};
```

This will embed the component `hello.html` with the given props into the file
located in `pages/other.html` and then serve it.

#### partial

You may sometimes want to serve only the component HTML (without the encasing
page). For that pass in the boolean property `partial` set to `true`.

```js caption=routes/view-partial.js
import { view } from "primate";

export default {
  get() {
    return view("hello.html", { hello: "world" }, { partial: true });
  },
};
```

This will render and serve the `hello.html` component without embedding it into
the default page HTML.

#### placeholders

To replace any placeholders of the form `%placeholder%` in your rendered HTML,
pass any an object property `placeholders`.

```js caption=routes/view-placeholders.js
import { view } from "primate";

export default {
  get() {
    return view("hello.html", { hello: "world" }, {
      placeholders: { api_key: "foobar" },
    });
  },
};
```

This will replace, within the rendered HTML (both the component and the page),
any occurrence of `%api_key%` with `"foobar"`.

## Error

The `error` handler allows you to generate an error (typically with a 4xx or
5xx status code). The most common error and the default of this handler is
`404 Not Found` using the content type `text/html`.

```js caption=routes/error.js
import { error } from "primate";

export default {
  get() {
    return error();
  },
};
```

A request to `/error` will result in a `404 Not Found` response.

You can customize the body and the status of this handler.

```js caption=routes/server-error.js
import { error, Status } from "primate";

export default {
  get() {
    const status = Status.INTERNAL_SERVER_ERROR;
    return error("Internal Server Error", { status });
  },
};
```

A request to `/server-error` will result in a `500` response with the HTML body
`Internal Server Error`.

## WebSocket

You can upgrade any `GET` route to a WebSocket route with the `ws` handler.

```js caption=routes/ws.js
import { ws } from "primate";

export default {
  get(request) {
    const limit = request.query.get("limit") ?? 20;
    let n = 1;
    return ws({
      open(socket) {
        // connection opens
      },
      message(socket, message) {
        if (n > 0 && n < limit) {
          n++;
          socket.send(`You wrote ${payload}`);
        }
      },
      close(socket) {
        // connection closes
      },
    });
  },
};
```

In this example, we have a small chat which reflects back anything to the user
up to a given number of messages, the default being 20.

```html caption=components/chat.html
<script>
  window.addEventListener("load", () => {
    // number of messages to reflect
    const limit = 20;
    const ws = new WebSocket(`ws://localhost:6161/chat?limit=${limit}`);

    ws.addEventListener("open", () => {
      document.querySelector("#chat").addEventListener("keypress", event => {
        if (event.key === "Enter") {
          ws.send(event.target.value);
          event.target.value = "";
        }
      })
    });

    ws.addEventListener("message", message => {
      const div = document.createElement("div");
      div.innerText = message.data
      document.querySelector("#box").appendChild(div);
    });
  });
</script>
<style>
.chatbox {
  background-color: lightgrey;
  width: 300px;
  height: 300px;
  overflow: auto;
}
</style>
<div class="chatbox" id="box"></div>
<input id="chat" placeholder="Type to chat" />
```

## Server-sent events

Similarly to `ws`, you can use the `sse` handler to upgrade a `GET` request to
stream out server-sent events to the client.

```js caption=routes/sse.js
import { sse } from "primate";

const passed = start_time => Math.floor((Date.now() - start_time) / 1000);

export default {
  get() {
    let interval;
    let start_time = Date.now();

    return sse({
      open(source) {
        // connection opens
        interval = globalThis.setInterval(() => {
          source.send("passed", passed(start_time));
        }, 5000);
      },
      close() {
        // connection closes
        globalThis.clearInterval(interval);
      },
    });
  },
};
```

In this example, we send a `passed` event to the client every 5 seconds,
indicating how many seconds have passed since the connection was established.
The client subscribes to this event and prints it to the console.

```html caption=components/sse-client.html
<script>
  new EventSource("/sse").addEventListener("passed", event => {
    console.log(`${JSON.parse(event.data)} seconds since connection opened`);
  });
</script>
```

This client is then served using another route.

```js caption=routes/sse-client.js
import { view } from "primate";

export default {
  get() {
    return view("sse-client.html");
  },
};
```

## Custom response

Lastly, for a custom response status, you can return a `Response` object from a
route.

```js caption=routes/response.js
import { Response, Status } from "primate";

export default {
  get() {
    return new Response("created!", { status: Status.CREATED });
  },
};
```

This route function will handle requests to the path `/response`.

This isn't actually a handler, but what all handlers eventually become, a
WHATWG [`Response`][whatwg-response] object.

[default-page]: /guide/configuration#index
[whatwg-response]: https://fetch.spec.whatwg.org/#response-class
[frontend]: /modules/frontend
