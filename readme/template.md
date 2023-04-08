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
  - [HTML](#html)
- [Routing](#routing)
  - [Basic](#basic)
  - [The request object](#the-request-object)
  - [Accessing the request body](#accessing-the-request-body)
  - [Regular expressions](#regular-expressions)
  - [Named groups](#named-groups)
  - [Aliasing](#aliasing)
  - [Sharing logic across requests](#sharing-logic-across-requests)
  - [Explicit handlers](#explicit-handlers)

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

### HTML

```js
// serving-content/html.js
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

Most often we can figure out the content type to respond with based on the
return type from the handler. To handle content not automatically detected, use
the second argument of the exported function.

```js
// routing/explicit-handlers.js
```

## Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

## License

MIT
