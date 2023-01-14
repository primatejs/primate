# Primate 

Server-client framework with data verification and server-side rendering (via
HTML, [React][primate-react] or [Vue][primate-vue]).

## Highlights

* Expressive routing, return HTML, JSON, or binary data
* HTTPS-only, hash-verified scripts, strong CSP
* Baked in support for sessions with secure cookies
* Input verification using data domains
* Many different data store modules: In-Memory (built-in),
[File][primate-file-store], [JSON][primate-json-store],
[MongoDB][primate-mongodb-store]
* Easy modeling of`1:1`, `1:n` and `n:m` relationships
* Minimally opinionated with sane, overridable defaults

## Getting started

Lay out app.

```sh
# getting-started/lay-out-app.sh
```

Create a route for `/` in `routes/site.js`.

```js
// getting-started/site.js
```

Create a component in `components/site-index.html`.

```html
<!-- getting-started/site-index.html -->
```

Generate SSL files.

```sh
# getting-started/generate-ssl.sh
```

Run

```sh
npx primate
```

## Table of contents

* [Serving content](#serving-content)
* [Routing](#routing)
* [Domains](#domains)
* [Stores](#stores)
* [Components](#components)

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

### HTML

Create an HTML component in `components/user-index.html`.

```html
<!-- serving-content/user-index.html -->
```

Serve the component in your route.

```js
// serving-content/html.js
```

## Routing

Routes map requests to responses. All routes are loaded from `routes`.

The order in which routes are declared is irrelevant. Redeclaring a route
(same pathname and same HTTP verb) throws a `RouteError`.

### Basic GET route

```js
// routing/basic-get-request.js
```

### Working with the request path

```js
// routing/working-with-the-request-path.js
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

### Sharing logic across HTTP verbs

```js
// routing/sharing-logic-across-http-verbs.js
```

## Domains

Domains represent a collection in a store. All domains are loaded from
`domains`.

A collection is primarily described using the class `fields` property.

### Fields

Field types delimit acceptable values for a field.

```js
// domains/fields.js
```

### Short field notation

Field types may be any constructible JavaScript object, including other
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

## Stores

Stores interface data. Primate comes with volatile in-memory store used as a
default. Other stores can be imported as modules.

All stores are loaded from `stores`.

### Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

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
