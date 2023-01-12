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
mkdir -p primate-app/{routes,components,ssl} && cd primate-app

```

Create a route for `/`

```js
import {html} from "primate";

export default router => {
  router.get("/", () => html`<site-index date="${new Date()}" />`);
};

```

Create a component for your route (in `components/site-index.html`)

```html
Today's date is ${date}.

```

Generate SSL key/certificate

```sh
openssl req -x509 -out ssl/default.crt -keyout ssl/default.key -newkey rsa:2048 -nodes -sha256 -batch

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
  router.get("/users", () => File.readable("users.json"));
};

```

### HTML

Create a `user-index.html` component in `components`

```html
<div for="${users}">
  User ${name}.
  Email ${email}.
</div>

```

Create a route and use the HTML handler to serve

```js
import {html} from "primate";

export default router => {
  // the HTML tagged template handler loads a component from the `components`
  // directory and serves it as HTML, passing any given data as attributes
  router.get("/users", () => {
    const users = [
      {name: "Donald", email: "donald@the.duck"},
      {name: "Joe", email: "joe@was.absent"},
    ];
    return html`<user-index users="${users}" />`;
  });
};

```

## Routing

Primate reads all routes from `routes`. You can group all routes in one file
or split them across several.

### Basic GET route
```js
import {html} from "primate";

export default router => {
  // accessing /site/login will serve the contents of 
  // `components/site-login.html` as HTML
  router.get("/site/login", () => html`<site-login />`);
};

```

### Working with the request path
```js
export default router => {
  // accessing /site/login will serve a `["site", "login"]` as JSON
  router.get("/site/login", request => request.path);
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
  // named groups are mapped to properties of request.named
  // accessing /user/view/1234 will serve `1234` as plain text
  router.get("/user/view/(<id>[0-9])+", ({named}) => named.id);
};

```

### Aliasing
```js
export default router => {
  // will replace "_id" in any path with "([0-9])+"
  router.alias("_id", "([0-9])+");

  // equivalent to `router.get(/user/view/([0-9])+, ...)`
  // will return id if matched, 404 otherwise
  router.get("/user/view/_id", request => request.path[2]);

  // can be combined with named groups
  router.alias("_name", "(<name>[a-z])+");

  // will return name if matched, 404 otherwise
  router.get("/user/view/_name", request => request.named.name);
};

```

### Sharing logic across verbs
```js
import {html, redirect} from "primate";

export default router => {
  // reuse _id
  router.alias("edit-user", "/user/edit/([0-9])+");

  // return user instead of request for all verbs with this route
  router.map("edit-user", () => ({name: "Donald"}));

  // show user edit form
  router.get("edit-user", user => html`<user-edit user="${user}" />`);

  // verify form and save, or show errors
  router.post("edit-user", async user => await user.save()
    ? redirect`/users`
    : html`<user-edit user="${user}" />`);
};

```

## Domains

Domains represent a collection in a store. All domains are loaded from
`domains`.

### Fields
Field types denote the acceptable type of values for a field.
```js
import {Domain} from "primate";

// A basic domain that contains two string properies
export default class User extends Domain {
  static fields = {
    // a user's name must be a string
    name: String,
    // a user's age must be a number
    age: Number,
  };
}


```

### Short field notation
Field types may be any constructible JavaScript object, including other
domains. Primate ensures integrity when using foreign domains.

```js
import {Domain} from "primate";
import House from "./House.js";

export default class User extends Domain {
  static fields = {
    // a user's name must be a string
    name: String,
    // a user's age must be a number
    age: Number,
    // a user's house must have the foreign id of a house record
    house_id: House,
  };
}

```

### Predicates
Field types may also be specified as an array, in which case they may contained
additional predicates.

```js
import {Domain} from "primate";
import House from "./House.js";

export default class User extends Domain {
  static fields = {
    // a user's name must be a string and unique across the user collection
    name: [String, "unique"],
    // a user's age must be a positive integer
    age: [Number, "integer", "positive"],
    // a user's house must have the foreign id of a house record and no two
    // users may have the same house
    house_id: [House, "unique"],
  };
}

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
