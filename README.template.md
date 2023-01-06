# Primate 

A full-stack Javascript framework with data verification and server-side
rendering (via web components, [React][primate-react] or [Vue][primate-vue]).

## Highlights

* Flexible HTTP routing, returning HTML, JSON or a custom handler
* Secure by default with HTTPS, hash-verified scripts and a strong CSP
* Built-in support for sessions with secure cookies
* Input verification using data domains
* Many different data store modules: In-Memory (built-in),
[File][primate-file-store], [JSON][primate-json-store],
[MongoDB][primate-mongodb-store]
* Easy modelling of`1:1`, `1:n` and `n:m` relationships
* Minimally opinionated with sane, overrideable defaults

## Getting started

Lay out your app

```sh
# scripts/lay-out-app.sh
```

Create a route for `/`

```js
// routes/site.js
```

Create a component for your route (in `components/site-index.html`)

```html
<!-- components/site-index.html -->
```

Generate SSL key/certificate

```sh
# scripts/generate-ssl.sh
```

Run Primate

```sh
npx primate
```

## Table of Contents

* [Routes](#routes)
* [Handlers](#handlers)
* [Components](#components)

## Routes

Create routes in the `routes` directory by importing and using the `router`
parameter. You can group your routes across several files or keep them
in one file.

### `router.get(pathname, request => ...)`

** Other HTTP verbs are accepted in place of `get`.

Routes are tied to a pathname and execute their callback when the pathname is 
encountered.

```js
// routes/some-file.js
```

All routes must return a template function handler. See the section on
[common handlers](#handlers) for more.

The callback has one parameter, the request data.

### The `request` object

The request contains the `path`, a `/` separated array of the pathname.

```js
// routes/request.js
```

The HTTP request's body is available under `request.payload`. 

### Regular expressions in routes

All routes are treated as regular expressions.

```js
// routes/regular-expressions.js
```

### `router.alias(from, to)`

To reuse certain parts of a pathname you can define aliases which will be
applied before matching.

```js
// routes/aliases.js
```

### `router.map(pathname, request => ...)`

You can reuse functionality across the same path but different HTTP verbs. This
function has the same signature as `router.get` etc.

```js
// routes/mapping.js
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
// routes/user.js
```

```html
<!-- components/edit-user.html -->
```

### Grouping objects with `for`

You can use the special attribute `for` to group objects.

```html
<!-- components/edit-user-for.html -->
```

### Expanding arrays

`for` can also be used to expand arrays.

```js
// routes/user-expand-arrays.js
```

```html
<!-- components/user-index.html -->
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
