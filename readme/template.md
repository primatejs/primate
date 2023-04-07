# Primate 

Expressive, minimal and extensible framework for JavaScript.

## Getting started

Create a route in `routes/hello.js`

```js
// getting-started.js
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
  - [HTMX](#htmx)
- [Modules](#modules)
  - [Data persistance](#data-persistance)

## Serving content

Create a file in `routes` that exports a default function.

### Plain text

```js
// serving-content/plain-text.js
```

### JSON

```js
// serving-content/json.js
```

### Streams

```js
// serving-content/streams.js
```

### Response

```js
// serving-content/response.js
```

## Routing

Routes map requests to responses. They are loaded from `routes`.

### Basic

```js
// routing/basic.js
```

### The request object

```js
// routing/the-request-object.js
```

### Accessing the request body

For requests containing a body, Primate will attempt to parse the body according
to the content type sent along the request. Currently supported are
`application/x-www-form-urlencoded` (typically for form submission) and
`application/json`.

```js
// routing/accessing-the-request-body.js
```

### Regular expressions

```js
// routing/regular-expressions.js
```

### Named groups

```js
// routing/named-groups.js
```

### Aliasing

```js
// routing/aliasing.js
```

### Sharing logic across requests

```js
// routing/sharing-logic-across-requests.js
```

### Explicit handlers

A lot of the time, Primate can figure the content type to respond with based on
the return type from the handler. To handle content not automatically detected
by Primate, you can use the second argument of the exported function.

```js
// routing/explicit-handlers.js
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
<!-- extensions/handlers/html/user-index.html -->
```

Create a route in `route/user.js` and serve the component in your route

```js
// extensions/handlers/html/user.js
```

#### HTMX

*[`@primate/htmx`][primate-htmx]*

Serve HTML tagged templates with HTMX support. This handler reads HTML component
files from `components`.

Create an HTML component in `components/user-index.html`

```html
<!-- extensions/handlers/htmx/user-index.html -->
```

Create a route in `route/user.js` and serve the component in your route

```js
// extensions/handlers/htmx/user.js
```

### Modules

To add modules, create a `primate.config.js` configuration file in your
project's root. This file should export a default object with the property
`modules` used for extending your app.

```js
// extensions/modules/configure.js
```

#### Data persistance

*[`@primate/domains`][primate-domains]*

Add data persistance in the form of ORM backed up by various drivers.

Import and initialize this module in your configuration file

```js
// extensions/modules/domains/configure.js
```

A domain represents a collection in a store using the static `fields` property

```js
// extensions/modules/domains/fields.js
```

Field types may also be specified as an array with additional predicates
aside from the type

```js
// extensions/modules/domains/predicates.js
```

## Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

## License

MIT

[primate-html]: https://github.com/primatejs/primate-html
[primate-htmx]: https://github.com/primatejs/primate-htmx
[primate-domains]: https://github.com/primatejs/primate-domains
[primate-sessions]: https://github.com/primatejs/primate-sessions
