# Primate 

Javascript framework with data verification and server-side rendering (via web
components, [React][primate-react] or [Vue][primate-vue]).

## Highlights

* Expressive routing, return HTML, JSON, or binary data
* Secure by design with HTTPS, hash-verified scripts and strong CSP
* Baked in support for sessions with secure cookies
* Input verification using data domains
* Many different data store modules: In-Memory (built-in),
[File][primate-file-store], [JSON][primate-json-store],
[MongoDB][primate-mongodb-store]
* Easy modeling of`1:1`, `1:n` and `n:m` relationships
* Minimally opinionated with sane, overridable defaults

## Getting started

Lay out app

```sh
# getting-started/lay-out-app.sh
```

Create a route for `/`

```js
// getting-started/site.js
```

Create a component for your route (in `components/site-index.html`)

```html
<!-- getting-started/site-index.html -->
```

Generate SSL key/certificate

```sh
# getting-started/generate-ssl.sh
```

Run Primate

```sh
npx primate
```

## TOC

* [Serving content](#serving-content)
* [Routing](#routing)
* [Domains](#domains)
* [Stores](#stores)
* [Components](#components)

## Serving content

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

Create a `user-index.html` component in `components`

```html
<!-- serving-content/user-index.html -->
```

Create a route and use the HTML handler to serve

```js
// serving-content/html.js
```

## Routing

Primate reads all routes from `routes`. You can group all routes in one file
or split them across several.

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

### Sharing logic across verbs
```js
// routing/sharing-logic-across-verbs.js
```

## Domains

Domains represent a collection in a store. All domains are loaded from
`domains`.

### Fields
Field types denote the acceptable type of values for a field.
```js
// domains/fields.js
```

### Short field notation
Field types may be any constructible JavaScript object, including other
domains. Primate ensures integrity when using foreign domains.

```js
// domains/short-field-notation.js
```

### Predicates
Field types may also be specified as an array, in which case they may contained
additional predicates.

```js
// domains/predicates.js
```

## Stores

Stores interface data. Primate comes with volatile in-memory store used as a
default. Other stores can be imported as modules.

All stores are loaded from `stores`.

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
