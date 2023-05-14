# Getting started

## Why Primate?

Primate is a expressive, minimal, and extensible web framework. It maps
requests to responses using filesystem-based routes, includes only the bare
essentials for web app development and can be easily extended with additional
modules for common scenarios. 

To illustrate this, if you want an app that responds with a `200 OK` saying
"Hello, world!" at its index route (`/`), create a route file inside your
project directory.

```js caption=routes/index.js
export default {
  get() {
    return "Hello, world!";
  },
};
```

To start your app, run `npx -y primate@latest` and point your browser to
http://localhost:6161.

## Quick start

Before we continue, we recommend installing Primate by issuing `npm i primate`
in your project directory, both to make its exports available within your
project and to pin the version you're using.

Building on the last example, imagine you wanted to add a form to your page
and redirect users who have submitted the form to a success page. This requires
first changing the previous route to show a form.

```js caption=routes/index.js
import {view} from "primate";

export default {
  get() {
    return view("form.html");
  },
}
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
the route function,
which Primate then translated to a `200 OK` response with content type
`text/plain`. Primate can detect the content type to use based on the return
type, but only where it makes sense. To return HTML (content type `text/html`),
we need to use the explicit request handler `view`, which we imported. It
accepts the name of a component file and renders it from the `components`
directory.

If you now go to http://localhost:6161, you will see an HTML form.

Next, we need to handle the form submission. We'll do that by adding a `post`
function to our route:

```js caption=routes/index.js
import {view, redirect} from "primate";

export default {
  get() {
    return view("form.html");
  },
  post(request) {
    const {name, age} = request.body;

    if (name !== undefined && age !== undefined) {
      return redirect("/success");
    }

    return redirect("/");
  },
}
```

Every route function in Primate accepts a `request` parameter that contains
request data, including the request body if applicable. Here, Primate
deserialized the form for us into `request.body` so we can easily access
its fields.

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

## Deep dive

Now that we've built a trivial use case with form submission, we can start
diving a bit deeper into the framework itself and what it offers.

You don't have to read this entire guide to get productive with Primate. If you
prefer a hands-on approach, you can jump in directly into coding and refer back
to it as necessary.

By running `npm create primate@latest`, you can scaffold a fresh project. This
GUI will walk you step by step in creating a project from scratch, generating a
configuration file and including additional modules.

Alternatively you can clone the [Primate template app][primate-app] repository
and start looking around. It features an exhausive example app that includes
various additional frontend frameworks as well as a bundler, a session manager
and a data store.

## More about goals

Primate strives for technical excellence, with a small core codebase and a
variety of officially supported modules that extend it.

### Expressive

* Routes are pure functions that transform requests into responses
* Route functions receive a prepared request object with easily accessible
`body`, `path`, `query`, `cookies` and `headers` fields

### Minimal

* No dependencies aside from [`runtime-compat`][runtime-compat], a
cross-runtime compatibility layer
* Under 0.8K lines of JavaScript code (Express > 1.8K, Fastify > 5.3K)

### Extensible

* Different hooks available (`load`, `register`, `compile`, `publish`,
`bundle`, `serve`, `handle`, `route`)
* Officially supported modules that are updated alongside Primate itself

## Resources

If you have a question that this guide doesn't cover, consider consulting the
code itself, asking in chat, or raising an issue.

### Code

[Primate's monorepo][repo] contains the core framework code under
`packages/primate` as well code for the official modules and the
website.

### Chat

Primate has an IRC channel at `#primate` on irc.libera.chat. You can use the
[Libera web client][chat] if you don't have an IRC client installed.

### Issues

Feel free to open an issue on [Primate's issue tracker][issues] if you find a
bug or have a feature request.

[repo]: https://github.com/primatejs/primate
[issues]: https://github.com/primatejs/primate/issues
[primate-app]: https://github.com/primatejs/app
[chat]: https://web.libera.chat#primate
[runtime-compat]: https://github.com/flogjs/std/tree/master/runtime-compat
