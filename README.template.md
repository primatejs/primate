# Primate 

An expressive, minimal and extensible framework for JavaScript.

## Getting started

Create a route in `routes/hello.js`

```js
// getting-started/hello.js
```

Add `{"type": "module"}` to your `package.json` and run `npx primate`.

## Table of Contents

- [Serving content](#serving-content)
  - [Plain text](#plain-text)
  - [JSON](#json)
  - [Streams](#streams)
  - [HTML](#html)
- [Routing](#routing)
  - [Basic](#basic)
  - [The request object](#the-request-object)
  - [Regular expressions](#regular-expressions)
  - [Named groups](#named-groups)
  - [Aliasing](#aliasing)
  - [Sharing logic across requests](#sharing-logic-across-requests)
- [Data persistance](#data-persistance)
  - [Short field notation](#short-field-notation)
  - [Predicates](#predicates)

## Serving content

Create a file in `routes` that exports a default function

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

### HTML

Create an HTML component in `components/user-index.html`

```html
<!-- serving-content/user-index.html -->
```

Serve the component in your route

```js
// serving-content/html.js
```

## Routing

Routes map requests to responses. They are loaded from `routes`.

The order in which routes are declared is irrelevant. Redeclaring a route
(same pathname and same HTTP verb) throws an error.

### Basic

```js
// routing/basic.js
```

### The request object

```js
// routing/the-request-object.js
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

## Data persistance 

Primate domains (via [`@primate/domains`][primate-domains]) represent a
collection in a store using the class `fields` property.

```js
// domains/fields.js
```

### Short field notation

Value types may be any constructible JavaScript object, including other
domains. When using other domains as types, data integrity (on saving) is
ensured.

```js
// domains/short-field-notation.js
```

### Predicates

Field types may also be specified as an array, to specify additional predicates
aside from the type.

```js
// domains/predicates.js
```

## Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

## License

MIT

[primate-domains]: https://github.com/primatejs/primate-domains
