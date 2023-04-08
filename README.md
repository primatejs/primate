# Primate 

Expressive, minimal and extensible framework for JavaScript.

## Getting started

Create a route in `routes/hello.js`

```js
export default router => {
  router.get("/", () => "Hello, world!");
};

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
export default router => {
  // Serve strings as plain text
  router.get("/user", () => "Donald");
};

```

### JSON

```js
import {File} from "runtime-compat/filesystem";

export default router => {
  // Serve proper JavaScript objects as JSON
  router.get("/users", () => [
    {name: "Donald"},
    {name: "Ryan"},
  ]);

  // Load from file and serve as JSON
  router.get("/users-from-file", () => File.json("users.json"));
};

```

### Streams

```js
import {File} from "runtime-compat/filesystem";

export default router => {
  // `File` implements `readable`, which is a `ReadableStream`
  router.get("/users", () => new File("users.json"));
};

```

### Response

```js
import {Response} from "runtime-compat/http";

export default router => {
  // Use a Response object for custom response status
  router.get("/create", () => new Response("created!", {status: 201}));
};

```

### HTML

```js
// Use an explicit handler as we can't detect HTML by the return value type
export default (router, {html}) => {
  // Embed components/hello-world.html into static/index.html and serve it. In
  // case a user-provided index.html doesn't exist, use a fallback index.html
  router.get("/hello", () => html("hello-world"));

  // Same as above, but without embedding
  router.get("/hello-partial", () => html("hello-world", {partial: true}));

  // Serve directly from string instead of loading a component
  router.get("/hello-adhoc", () => html("<p>Hello, world!</p>", {adhoc: true}));
};

```

## Routing

Routes map requests to responses. They are loaded from `routes`.

### Basic

```js
export default router => {
  // accessing /site/login will serve `Hello, world!` as plain text
  router.get("/site/login", () => "Hello, world!");
};

```

### The request object

```js
export default router => {
  // accessing /site/login will serve `["site", "login"]` as JSON
  router.get("/site/login", request => request.path);
};

```

### Accessing the request body

For requests containing a body, Primate will attempt to parse the body according
to the content type sent along the request. Currently supported are
`application/x-www-form-urlencoded` (typically for form submission) and
`application/json`.

```js
export default router => {
  router.post("/site/login", ({body}) => `submitted user: ${body.username}`);
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

### Sharing logic across requests

```js
export default router => {
  // Declare `"edit-user"` as alias of `"/user/edit/([0-9])+"`
  router.alias("edit-user", "/user/edit/([0-9])+");

  // Pass user instead of request to all verbs on this route
  router.map("edit-user", ({body}) => body?.name ?? "Donald");

  // Show user as plain text
  router.get("edit-user", user => user);

  // Verify or show error
  router.post("edit-user", user => user === "Donald"
    ? "Hi Donald!"
    : {message: "Error saving user"});
};

```

### Explicit handlers

Most often we can figure out the content type to respond with based on the
return type from the handler. To handle content not automatically detected, use
the second argument of the exported function.

```js
export default (router, {redirect}) => {
  // redirect from source to target
  router.get("/source", () => redirect("/target"));
};

```

## Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

## License

MIT
