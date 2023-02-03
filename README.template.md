# Primate 

An expressive, minimal and extensible framework for JavaScript.

## Getting started

Create a route in `routes/hello.js`

```js
// getting-started/hello.js
```

Add `{"type": "module"}` to your `package.json` and run `npx primate`.

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

Domains represent a collection in a store, primarily with the class `fields`
property.

### Fields

Field types delimit acceptable values for a field.

```js
// domains/fields.js
```

### Short notation

Field types may be any constructible JavaScript object, including other
domains. When using other domains as types, data integrity (on saving) is
ensured.

```js
// domains/short-notation.js
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
