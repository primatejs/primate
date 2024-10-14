# Why Primate?

Primate is a framework for building web applications focused on flexibility and
developer freedom.

Other software locks you in. Primate offers you unlimited choice in mixing and
matching different tools that work best for you rather than forcing to you
accept the limitations and design decisions made by others.

Specifically, Primate has a few design goals that make it unique.

## Native runtime support

Primate has full support for all major runtimes – Node, Deno and Bun. Wherever
relevant, it will leverage the runtime's specific APIs to make sure your
application benefits from native performance gains.

```sh
$ npx -y primate@latest
```

## Any frontend

Primate has built-in support for all major frontends – React, Vue, Svelte and
Angular -- and many other lesser known frontends, which you can all freely
combine. It also supports Web Components and using props in HTML and HTMX
views.

```jsx
export default ({ posts }) => {
  return (<>
    <h1>All posts</h1>
    {posts.map(post => (
      <h2 key={post.id}>
        <a href={`/post/${post.id}`}>
          {post.title}
        </a>
      </h2>
    ))}
  </>);
};
```

## Different backends

Primate is the only web framework to support more than a single backend. Aside
from its native JavaScript/TypeScript, Primate also allows you to combine
backend code in Go, Ruby and Python. Other backends are in the pipeline.

```js caption=JavaScript
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.jsx", { posts });
  },
};
```

## Several environments

Primate applications are normally built for the web, but can also be compiled
into distributable executables. Static pages and cloud deployment targets are
in the pipeline.

## Extensive ecosystem

Rather than looking elsewhere for solutions to common requirements, Primate
offers an extensive ecosystem, including input validation, databases with ORM
support, authenticating/sessions, payment, i18n and others. All packages under
the `@primate` namespace is officially supported and guaranteed to work with
the latest version of Primate.

## Installation

Primate supports all major runtimes and package managers. Use your package
manager of choice to install it.


Primate is a zero configuration framework. TIt prTo run your app, 

## First steps

To create a simple app that responds with a `200 OK` saying "Hello, world!"
at its index route (`/`), create a project directory and a file in `routes`.

```js caption=routes/index.js
export default {
  get() {
    return "Hello, world!";
  },
};
```

To start your app, run `npx -y primate@latest` and point your browser to
http://localhost:6161.

!!!
Primate is a multi-runtime platform. If you're a Bun user, you can take
advantage of [significant speed gains][r24] by running `bun --bun x primate`.
If you're a Deno user, use `deno run -A npm:primate` to run Primate.
!!!

!!!
If you're using Node, make sure you add `{ "type": "module" }` to your
`package.json` file for Node to treat JavaScript files as ESM.
!!!

## Multi-language support in routes

Primate isn't limited to JavaScript for your backend code. If you're a Go
developer, you can easily do the same with a Go route.

```go caption=routes/index.go
func Get(request Request) any {
  return "Hello, world!";
}
```

Or with a Python route if you're a Python developer.

```py caption=routes/index.py
def get(request):
    return "Hello, world!"
```

Same as before, run `npx -y primate@latest` and point your browser to
http://localhost:6161 to run your route.

!!!
Additional backend languages require loading
[additional backend packages](https://primatejs.com/modules/backend) in your
config.
!!!

## Serving HTML

Before we continue, we recommend installing Primate by issuing
`npm install primate` in your project directory, both to make its exports
available within your project and to pin the version you're using.

Building on the last example, imagine you wanted to add a form to your page
and redirect users who have submitted the form to a success page. This requires
first changing the previous route to show a form.

```js caption=routes/index.js
import view from "primate/handler/view";

export default {
  get() {
    return view("form.html");
  },
};
```

We also need to create an HTML component for the form.

```html caption=components/form.html
<form>
  <label for="name">Enter name</label>
  <input type="text" id="name" required />
  <label for="name">Enter age</label>
  <input type="number" id="age" required />
</form>
```

You may have noticed in our first example that we simply returned a string from
the route function, which was then translated to a `200 OK` response with
content type `text/plain`. Primate can detect the content type to use based on
the return type, but only where it makes sense. To return HTML (content type
`text/html`), we need to use the explicit request handler `view` which we
imported. It accepts the name of a component file and renders it from the
`components` directory.

If you now go to http://localhost:6161, you will see an HTML form.

Next we need to handle the form submission. We'll do that by adding a `post`
function to our route.

```js caption=routes/index.js
import view from "primate/handler/view";
import redirect from "primate/handler/redirect";

export default {
  get() {
    return view("form.html");
  },
  post(request) {
    const { name, age } = request.body;

    if (name !== undefined && age !== undefined) {
      return redirect("/success");
    }

    return redirect("/");
  },
};
```

Every route function in Primate accepts a `request` parameter that contains
request data, including the request body if applicable. Here, Primate
deserialized the form for us into `request.body` so we can easily get its
fields.

In case both `name` and `age` are set, we redirect the user to `/success` by
using the `redirect` handler Primate provides.

While we did specify in our HTML that both `name` and `age` are required
fields, we need to account for a possible client-side manipulation, so in the
alternative case that the fields aren't set, we simply redirect back to our
form.

All that's left is the success page, which we will handle by creating an
additional route file.

```js caption=routes/success.js
export default {
  get() {
    return "Thank you for submitting your data, we will get back to you.";
  },
};
```

## Using a frontend framework

Beyond pure HTML, Primate supports a variety of frontend frameworks. Here is
the same code as before, in Svelte.

First add Svelte support by issuing `npm install @primate/svelte` and
loading it your configuration file.

```js caption=primate.config.js
import svelte from "@primate/svelte";

export default {
  modules: [
    svelte(),
  ],
};
```

For Svelte, you will also need to install Svelte itself, `npm install
svelte@4`.

Now change your route to serve a Svelte component.

```js caption=routes/index.js
import view from "primate/handler/view";

export default {
  get() {
    return view("Form.svelte", { name: "Donald" });
  },
  post(request) {
    const { name, age } = request.body;

    if (name !== undefined && age !== undefined) {
      return redirect("/success");
    }

    return redirect("/");
  },
};
```

Create the Svelte component.

```svelte caption=components/Form.svelte
<script>
  export let name;
</script>
<form>
  <label for="name">Enter name</label>
  <input type="text" id="name" bind:value={name} required />
  <label for="name">Enter age</label>
  <input type="number" id="age" required />
</form>
```

If you now go to http://localhost:6161, you will see an HTML form -- rendered
by Svelte.

!!!
It is likewise easily possible to write React, Vue or HTMX components. Refer to
the [frontend] page to see what's available.
!!!

## Deeper dive

Now that we've built a trivial use case with form submission, we can start
diving a bit deeper into the platform itself and what it offers.

You don't have to read this entire guide to get productive with Primate. If you
prefer a hands-on approach, you can jump in directly into coding and refer back
to it as necessary.

By running `npm create primate@latest`, you can scaffold a fresh project. This
TUI will walk you step by step in creating a project from scratch, generating a
configuration file and including additional modules.

Alternatively you can clone the [Primate template app][primate-app] repository
and start looking around. It features an exhausive example app that includes
various additional frontend frameworks as well as a bundler, a session manager
and a data store.

## Goals

Primate strives for technical excellence, with a small core codebase and a
variety of officially supported modules that extend it. This translates into
three goals.

### Expressive

* Routes are pure functions that transform requests into responses
* Route functions accept a prepared request object with easily accessible
`body`, `path`, `query`, `cookies` and `headers` fields

### Minimal

* No dependencies aside from [`rcompat`][rcompat], a JavaScript interoperability
& runtime compatibility layer
* Under 1K lines of JavaScript code (Express > 1.8K, Fastify > 5.3K)

### Extensible

* Different hooks available (`load`, `init`, `build`, `serve`, `handle`,
`route`, `context`)
* Officially supported modules that are updated alongside Primate itself

## Resources

If you have a question that this guide doesn't cover, consider consulting the
code itself, asking in chat, or raising an issue.

### Code

[Primate's monorepo][repo] contains the core platform code under
`packages/primate` as well code for the official modules and the
website under `packages`.

### Chat

Primate has an IRC channel at `#primate` on irc.libera.chat. You can use the
[Libera web client][chat] if you don't have an IRC client installed.

### Issues

Feel free to open an issue on [Primate's issue tracker][issues] if you find a
bug or have a feature request.

[r24]: /blog/release-024
[repo]: https://github.com/primatejs/primate
[issues]: https://github.com/primatejs/primate/issues
[primate-app]: https://github.com/primatejs/app
[chat]: https://web.libera.chat#primate
[rcompat]: https://github.com/rcompat/rcompat
[frontend]: /modules/frontend
