# Ruby

This binding introduces support for routes written in Ruby.

## Install

`npm install @primate/binding @ruby/head-wasm-wasi@2.5 @ruby/wasm-wasi@2.5`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import { ruby } from "@primate/binding";

export default {
  modules: [
    ruby(),
  ],
};
```

## Use

### Plain text

[JavaScript documentation][plain text]

Strings are served with the content type `text/plain`.

```rb caption=routes/plain-text.rb
def get(request)
  "Donald"
end
```

This route function handles GET requests to the path `/plain-text` by serving
them the string "Donald" in plain text.

### JSON

[JavaScript documentation][JSON]

Hashes and arrays are served with the content type `application/json`.

```rb caption=routes/json.rb
def get(request)
  [
    { name: "Donald" },
    { name: "Ryan" },
  ]
end
```

This route function handles GET requests to the path `/json` by serving them a
JSON array.

### Redirect

[JavaScript documentation][redirect]

The `Primate.redirect` handler allows you to redirect responses.

```rb caption=routes/redirect.rb
def get(request)
  Primate.redirect("https://primatejs.com")
end
```

To use a different redirect status, use the second parameter as a dictionary
with a `status` field.

```rb caption=routes/redirect.rb
def get(request)
  Primate.redirect("https://primatejs.com", { status: 301 })
end
```

### View

[JavaScript documentation][view]

The `Primate.view` handler allows you to serve responses with content type
`text/html` from the `components` directory.

```rb caption=routes/view.rb
def get(request)
  Primate.view("hello.html")
end
```

In this case, Primate will load the HTML component at `components/hello.html`,
inject the HTML component code into the index file located at `pages/app.html`
and serve the resulting file at the path GET `/html`. In case no such file
exists, Primate will fall back to its [default app.html][default-index].

```html caption=components/hello.html
<p>Hello, world!</p>
```

If you're using any of the supported frontends, you can also pass props
directly to the frontend component.

First, create the frontend component, in this case Svelte.

```svelte caption=components/PostIndex.svelte
<script>
  export let posts;
</script>
<h1>All posts</h1>
{#each posts as { id, title }}
<h2><a href="/post/{id}">{title}</a></h2>
{/each}
<style>
  button {
    border-radius: 4px;
    background-color: #5ca1e1;
    border: none;
    color: #fff;
    display: block;
  }
</style>
```

Then create the route, and pass props to the component.

```rb caption=routes/svelte.rb
def get(request)
  posts = [{
    id: 1,
    title: "First post",
  }]
  Primate.view("PostIndex.svelte", { posts: posts })
end
```

The rendered route with a Svelte component will be accessible at
http://localhost:6161/svelte.

### Error

[JavaScript documentation][error]

The `Primate.error` handler allows you to generate an error (typically with a 
4xx or 5xx status code). The most common error and the default of this handler 
is `404 Not Found` using the content type `text/html`.

```rb caption=routes/error.rn
def get(request)
  Primate.error()
end
```

A request to `/error` will result in a `404 Not Found` response.

You can customize the body and the status of this handler.

```rb caption=routes/server-error.rb
def get(request)
  Primate.error("Internal Server Error", { status: 500 })
end
```

A request to `/server-error` will result in a `500` response with the HTML body
`Internal Server Error`.

### The request object

Route verb functions accept a single parameter representing request data. This
aggregate object allows easy access to the request `body`, any `path`
parameters defined with braces, the `query` string split into parts, `cookies`
as well as other `headers`.

### Body

[JavaScript documentation][body]

The request body.

```rb caption=routes/your-name.rb
def post(request)
  "Hello, " + request.body["name"]
end
```

If a client sends a POST request to `/your-name` using the content type
`application/json` and `{"name": "Donald"}` as body, this route will respond
with 200 saying  `Hello, Donald`.

### Path, Query, Cookies, Headers

[JavaScript documentation][path]

As in JavaScript, these properties work as dispatchers, providing a `get`
function to access individual properties. In addition, any types defined in
`types` will be available to the dispatcher.

Suppose you have defined the following type.

```js caption=types/uuid.js
import { is } from "rcompat/invariant";

const valid = /^[^\W_]{8}-[^\W_]{4}-[^\W_]{4}-[^\W_]{4}-[^\W_]{12}$/u;

export default {
  base: "string",
  validate(value) {
    // make sure value is a string, otherwise throw
    is(value).string();

    if (valid.test(value)) {
      return value;
    }
    throw new Error(`${value} is not a valid UUID`);
  },
};
```

You can then use `request.body.getUuid` in any of your routes.

### Session

[JavaScript documentation][session]

If the `@primate/session` module is active, the `request` object passed to a
route will contain an additional `session` property, allowing you to retrieve
and set session data from within Ruby.

Here is a route that, in case a session does not exist, creates it with a
`count` equaling 0 and otherwise increments `count` by 1. In both cases, the
session data is served to the client as JSON.

```rb caption=routes/session.rb
def get(request)
  if !request.session.exists
    request.session.create({"count": 0})
  else
    count = request.session.get("count")
    request.session.set("count", count + 1)
  end

  { count: request.session.get("count")}
end
```

## Configuration options

### extension

Default `".rb"`

The file extension associated with Ruby routes.

[plain text]: /guide/responses#plain-text
[json]: /guide/responses#json
[redirect]: /guide/responses#redirect
[error]: /guide/responses#error
[view]: /guide/responses#view
[body]: /guide/routes#body
[path]: /guide/routes#path
[default-index]:
https://github.com/primatejs/primate/blob/master/packages/primate/src/defaults/app.html
