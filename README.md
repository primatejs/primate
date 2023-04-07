# Primate 

Expressive, minimal and extensible framework for JavaScript.

## Getting started

Create a route in `routes/hello.js`

```js
export default router => {
  router.get("/", () => "Hello, world!");
};

```

Add `{"type": "module"}` to your `package.json` and run `npx -y primate@latest`.

## Table of Contents

- [Serving content](#serving-content)
  - [Plain text](#plain-text)
  - [JSON](#json)
  - [Streams](#streams)
  - [Response](#response)
- [Routing](#routing)
  - [Basic](#basic)
  - [The request object](#the-request-object)
  - [Accessing the request body](#accessing-the-request-body)
  - [Regular expressions](#regular-expressions)
  - [Named groups](#named-groups)
  - [Aliasing](#aliasing)
  - [Sharing logic across requests](#sharing-logic-across-requests)
  - [Explicit handlers](#explicit-handlers)
- [Extensions](#extensions)
- [Handlers](#handlers)
  - [HTML](#html)
  - [Redirect](#redirect)
  - [HTMX](#htmx)
- [Modules](#modules)
  - [Data persistance](#data-persistance)

## Serving content

Create a file in `routes` that exports a default function.

### Plain text

```js
export default router => {
  // strings will be served as plain text
  router.get("/user", () => "Donald");
};

```

### JSON

```js
import {File} from "runtime-compat/filesystem";

export default router => {
  // any proper JavaScript object will be served as JSON
  router.get("/users", () => [
    {name: "Donald"},
    {name: "Ryan"},
  ]);

  // load from a file and serve as JSON
  router.get("/users-from-file", () => File.json("users.json"));
};

```

### Streams

```js
import {File} from "runtime-compat/filesystem";

export default router => {
  // `File` implements `readable`, which is a `ReadableStream`
  router.get("/users", () => new File("users.json"));
};

```

### Response

```js
import {Response} from "runtime-compat/http";

export default router => {
  // use a generic response instance for a custom response status
  router.get("/create", () => new Response("created!", {status: 201}));
};

```

## Routing

Routes map requests to responses. They are loaded from `routes`.

### Basic

```js
export default router => {
  // accessing /site/login will serve `Hello, world!` as plain text
  router.get("/site/login", () => "Hello, world!");
};

```

### The request object

```js
export default router => {
  // accessing /site/login will serve `["site", "login"]` as JSON
  router.get("/site/login", request => request.path);
};

```

### Accessing the request body

For requests containing a body, Primate will attempt to parse the body according
to the content type sent along the request. Currently supported are
`application/x-www-form-urlencoded` (typically for form submission) and
`application/json`.

```js
export default router => {
  router.post("/site/login", ({body}) => `submitted user: ${body.username}`);
};

```

### Regular expressions

```js
export default router => {
  // accessing /user/view/1234 will serve `1234` as plain text
  // accessing /user/view/abcd will show a 404 error
  router.get("/user/view/([0-9])+", request => request[2]);
};

```

### Named groups

```js
export default router => {
  // named groups are mapped to properties of `request.named`
  // accessing /user/view/1234 will serve `1234` as plain text
  router.get("/user/view/(?<_id>[0-9])+", ({named}) => named._id);
};

```

### Aliasing

```js
export default router => {
  // will replace `"_id"` in any path with `"([0-9])+"`
  router.alias("_id", "([0-9])+");

  // equivalent to `router.get("/user/view/([0-9])+", ...)`
  // will return id if matched, 404 otherwise
  router.get("/user/view/_id", request => request.path[2]);

  // can be combined with named groups
  router.alias("_name", "(?<name>[a-z])+");

  // will return name if matched, 404 otherwise
  router.get("/user/view/_name", request => request.named.name);
};

```

### Sharing logic across requests

```js
import html from "@primate/html";
import redirect from "@primate/redirect";

export default router => {
  // declare `"edit-user"` as alias of `"/user/edit/([0-9])+"`
  router.alias("edit-user", "/user/edit/([0-9])+");

  // pass user instead of request to all verbs with this route
  router.map("edit-user", () => ({name: "Donald"}));

  // show user edit form
  router.get("edit-user", user => html("user-edit", {user}));

  // verify form and save, or show errors
  router.post("edit-user", async user => await user.save()
    ? redirect("/users")
    : html`<user-edit user="${user}" />`);
};

```

### Explicit handlers

A lot of the time, Primate can figure the content type to respond with based on
the return type from the handler. To handle content not automatically detected
by Primate, you can use the second argument of the exported function.

```js
export default (router, {redirect}) => {
  // redirect from source to target
  router.get("/source", () => redirect("/target"));
};

```

## Extensions

There are two ways to extend Primate's core functionality. Handlers are used
per route to serve new types of content not supported by core. Modules extend
an app's entire scope.

Handlers and modules listed here are officially developed and supported by
Primate.

### Handlers

#### HTML

*[`@primate/html`][primate-html]*

Serve HTML tagged templates. This handler reads HTML component files from
`components`.

Create an HTML component in `components/user-index.html`

```html
<div for="${users}">
  User ${name}.
  Email ${email}.
</div>

```

Create a route in `route/user.js` and serve the component in your route

```js
import html from "@primate/html";

export default router => {
  // the HTML tagged template handler loads a component from the `components`
  // directory and serves it as HTML, passing any given data as attributes
  router.get("/users", () => {
    const users = [
      {name: "Donald", email: "donald@the.duck"},
      {name: "Joe", email: "joe@was.absent"},
    ];
    return html("user-index", {users});
  });
};

```

#### HTMX

*[`@primate/htmx`][primate-htmx]*

Serve HTML tagged templates with HTMX support. This handler reads HTML component
files from `components`.

Create an HTML component in `components/user-index.html`

```html
<div for="${users}" hx-get="/other-users" hx-swap="outerHTML">
  User ${name}.
  Email ${email}.
</div>

```

Create a route in `route/user.js` and serve the component in your route

```js
import {default as htmx, partial} from "@primate/htmx";

export default router => {
  // the HTML tagged template handler loads a component from the `components`
  // directory and serves it as HTML, passing any given data as attributes
  router.get("/users", () => {
    const users = [
      {name: "Donald", email: "donald@the.duck"},
      {name: "Joe", email: "joe@was.absent"},
    ];
    return htmx("user-index", {users});
  });

  // this is the same as above, with support for partial rendering (without
  // index.html)
  router.get("/other-users", () => {
    const users = [
      {name: "Other Donald", email: "donald@the.goose"},
      {name: "Other Joe", email: "joe@was.around"},
    ];
    return partial("user-index", {users});
  });
};

```

### Modules

To add modules, create a `primate.config.js` configuration file in your
project's root. This file should export a default object with the property
`modules` used for extending your app.

```js
export default {
  modules: [],
};

```

#### Data persistance

*[`@primate/domains`][primate-domains]*

Add data persistance in the form of ORM backed up by various drivers.

Import and initialize this module in your configuration file

```js
import domains from "@primate/domains";

export default {
  modules: [domains()],
};

```

A domain represents a collection in a store using the static `fields` property

```js
import {Domain} from "@primate/domains";

// A basic domain with two properies
export default class User extends Domain {
  static fields = {
    // a user's name is a string
    name: String,
    // a user's age is a number
    age: Number,
  };
}

```

Field types may also be specified as an array with additional predicates
aside from the type

```js
import {Domain} from "@primate/domains";
import House from "./House.js";

export default class User extends Domain {
  static fields = {
    // a user's name is a string unique across the user collection
    name: [String, "unique"],
    // a user's age is a positive integer
    age: [Number, "integer", "positive"],
    // a user's house has the foreign id of a house record and no two
    // users may have the same house
    house_id: [House, "unique"],
  };
}

```

## Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

## License

MIT

[primate-html]: https://github.com/primatejs/primate-html
[primate-redirect]: https://github.com/primatejs/primate-redirect
[primate-htmx]: https://github.com/primatejs/primate-htmx
[primate-domains]: https://github.com/primatejs/primate-domains
[primate-sessions]: https://github.com/primatejs/primate-sessions
