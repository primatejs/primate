# Primate 

Primal JavaScript framework.

## Getting started

Lay out app

```sh
mkdir -p app/{routes,components,ssl} && cd app

```

Create a route for `/` in `routes/site.js`

```js
import html from "@primate/html";

export default router => {
  router.get("/", () => html`<site-index date="${new Date()}" />`);
};

```

Create a component in `components/site-index.html`

```html
Today's date is ${date}.

```

Generate SSL files

```sh
openssl req -x509 -out ssl/default.crt -keyout ssl/default.key -newkey rsa:2048 -nodes -sha256 -batch

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

Create a file in `routes` that exports a default function

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
  // `File` implements `readable`, which is a ReadableStream
  router.get("/users", () => new File("users.json"));
};

```

### HTML

Create an HTML component in `components/user-index.html`

```html
<div for="${users}">
  User ${name}.
  Email ${email}.
</div>

```

Serve the component in your route

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
    return html`<user-index users="${users}" />`;
  });
};

```

## Routing

Routes map requests to responses. Routes are loaded from `routes`.

The order in which routes are declared is irrelevant. Redeclaring a route
(same pathname and same HTTP verb) throws a `RouteError`.

### Basic GET route

```js
import html from "@primate/html";

export default router => {
  // accessing /site/login will serve the contents of
  // `components/site-login.html` as HTML
  router.get("/site/login", () => html`<site-login />`);
};

```

### Working with the request path

```js
export default router => {
  // accessing /site/login will serve `["site", "login"]` as JSON
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

### Sharing logic across HTTP verbs

```js
import html from "@primate/html";
import redirect from "@primate/redirect";

export default router => {
  // declare `"edit-user"` as alias of `"/user/edit/([0-9])+"`
  router.alias("edit-user", "/user/edit/([0-9])+");

  // pass user instead of request to all verbs with this route
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

Domains represent a collection in a store, primarily with the class `fields`
property.

### Fields

Field types delimit acceptable values for a field.

```js
import {Domain} from "@primate/domains";

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

### Short notation

Field types may be any constructible JavaScript object, including other
domains. When using other domains as types, data integrity (on saving) is
ensured.

```js
import {Domain} from "@primate/domains";
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

Field types may also be specified as an array, to specify additional predicates
aside from the type.

```js
import {Domain} from "@primate/domains";
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

Stores are loaded from `stores`.

### Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

## License

MIT
