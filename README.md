# Primate 

Full-stack Javascript framework with data verification and server-side
rendering (either HTML, [React][primate-react] or [Vue][primate-vue]).

## Highlights

* Flexible HTTP routing, returning HTML, JSON or a custom handler
* Secure by default with HTTPS, hash-verified scripts and a strong CSP
* Built-in support for sessions with secure cookies
* Input verification using data domains
* Several data stores available: In-Memory (built-in),
[File][primate-file-store], [JSON][primate-json-store],
[MongoDB][primate-mongodb-store]
* Easy modelling of`1:1`, `1:n` and `n:m` relationships
* Minimally opinionated with sane, overrideable defaults

## Getting started

Lay out your app

```sh
mkdir -p primate-app/{routes,components,ssl} && cd primate-app

```

Create a route for `/`

```js
import {router, html} from "primate";

router.get("/", () => html`<site-index date="${new Date()}" />`);

```

Create a component for your route (in `components/site-index.html`)

```html
Today's date is ${date}.

```

Generate SSL key/certificate

```sh
openssl req -x509 -out ssl/app.crt -keyout ssl/app.key -newkey rsa:2048 -nodes -sha256 -batch

```

Add an entry file

```js
import {app} from "primate";
app.run();

```

Install Primate and run

```sh
npm install primate && node --experimental-json-modules app.js

```

## Table of Contents

* [Routes](#routes)
* [Handlers](#handlers)
* [Components](#components)

## Routes

Create routes in the `routes` directory by importing and using the `router`
singleton. You can group your routes across several files or keep them
in one file.

### `router[delete|get|post|put](pathname, request => ...)`

Routes are tied to a pathname and execute their callback when the pathname is 
encountered.

```js
import {router, json} from "primate";

// on matching the exact pathname /, returns {foo: "bar"} as JSON
router.get("/", () => json`${{foo: "bar"}}`);

// you can also have Primate figure out the handler on its own, in this case
`json`
router.get("/", () => ({foo: "bar"}));
```

All routes must return a template function handler. See the
[section on handlers for common handlers](#handlers).
The callback has one parameter, the request data.

### The `request` object

The request contains the `path`, a `/` separated array of the pathname.

```js
import {router, json} from "primate";

router.get("/site/login", request => json`${{path: request.path}}`);
// accessing /site/login -> {path:["site","login"]}

// or get `path` via destructuring
router.get("/site/login", ({path}) => json`${{path}}`);
```

The HTTP request's body is available under `request.payload`. 

### Regular expressions in routes

All routes are treated as regular expressions.

```js
import {router, json} from "primate";

router.get("/user/view/([0-9])+", request => json`${{path: request.path}}`);
// accessing /user/view/1234 -> {path:["site","login","1234"]}
// accessing /user/view/abcd -> error 404
```

### `router.alias(from, to)`

To reuse certain parts of a pathname you can define aliases which will be
applied before matching.

```js
import {router, json} from "primate";

router.alias("_id", "([0-9])+");

router.get("/user/view/_id", request => json`${{path: request.path}}`);

router.get("/user/edit/_id", request => json`${{path: request.path}}`);

```

### `router.map(pathname, request => ...)`

You can reuse functionality across the same path but different HTTP verbs. This
function has the same signature as `router.get` and other HTTP verbs.

```js
import {router, html, redirect} from "primate";

router.alias("_id", "([0-9])+");

router.map("/user/edit/_id", request => {
  const user = {name: "Donald"};
  // return original request and user
  return {...request, user};
});

router.get("/user/edit/_id", request => {
  // show user edit form
  return html`<user-edit user="${request.user}" />`;
});

router.post("/user/edit/_id", async request => {
  const {user} = request;
  // verify form and save / show errors
  return await user.save()
    ? redirect`/users`
    : html`<user-edit user="${user}" />`;
});

```

## Handlers

Handlers are tagged template functions usually associated with data.

### ``html`<component-name attribute="${value}" />` ``

Compiles and serves a component from the `components` directory and with the
specified attributes and their values. Returns an HTTP 200 response with the
`text/html` content type.

### ``json`${{data}}` ``

Serves JSON `data`. Returns an HTTP 200 response with the `application/json`
content type.

### ``redirect`${url}` ``

Redirects to `url`. Returns an HTTP 302 response.

## Components

Create HTML components in the `components` directory. Use attributes to expose
passed data within your component.

```js
import {router, html, redirect} from "primate";

router.alias("_id", "([0-9])+");

router.map("/user/edit/_id", request => {
  const user = {name: "Donald", email: "donald@was.here"};
  // return original request and user
  return {...request, user};
});

router.get("/user/edit/_id", request => {
  // show user edit form
  return html`<user-edit user="${request.user}" />`;
});

router.post("/user/edit/_id", async request => {
  const {user, payload} = request;
  // verify form and save / show errors
  // this assumes `user` has a method `save` to verify data
  return await user.save(payload)
    ? redirect`/users`
    : html`<user-edit user="${user}" />`;
});

```

```html
<form method="post">
  <h1>Edit user</h1>
  <p>
    <input name="name" value="${user.name}"></textarea>
  </p>
  <p>
    <input name="email" value="${user.email}"></textarea>
  </p>
  <input type="submit" value="Save user" />
</form>
```

### Grouping objects with `for`

You can use the special attribute `for` to group objects.

```html
<form for="${user}" method="post">
  <h1>Edit user</h1>
  <p>
    <input name="name" value="${name}" />
  </p>
  <p>
    <input name="email" value="${email}" />
  </p>
  <input type="submit" value="Save user" />
</form>
```

### Expanding arrays

`for` can also be used to expand arrays.

```js
import {router, html} from "primate";

router.get("/users", () => {
  const users = [
   {name: "Donald", email: "donald@was.here"},
   {name: "Ryan", email: "ryan@was.here"},
  ];
  return html`<user-index users="${users}" />`;
});

```

```html
<div for="${users}">
  User: ${name}
  Email: ${email}
</div>

```

## Resources

* [Getting started guide][getting-started]

## License

MIT

[getting-started]: https://primatejs.com/getting-started
[source-code]: https://github.com/primatejs/primate
[issues]: https://github.com/primatejs/primate/issues
[primate-file-store]: https://npmjs.com/primate-file-store
[primate-json-store]: https://npmjs.com/primate-json-store
[primate-mongodb-store]: https://npmjs.com/primate-mongodb-store
[primate-react]: https://github.com/primatejs/primate-react
[primate-vue]: https://github.com/primatejs/primate-vue
