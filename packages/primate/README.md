# Primate 

Expressive, minimal and extensible framework for JavaScript

## Getting started

Run `npx -y primate@latest create` to create a project structure.

Create a route in `routes/index.js`

```js
export default {
  get() {
    return "Hello, world!";
  },
};

```

Run `npm i && npm start` and visit `localhost:6161` in your browser.

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
  - [Parameterized routes](#parameterized-routes)
  - [Explicit handlers](#explicit-handlers)

## Serving content

Create a file in `routes/index.js` to handle the special `/` route.

### Plain text

```js
// routes/index.js handles the `/` route
export default {
  get() {
    // strings are served as plain text
    return "Donald";
  },
};

```

### JSON

```js
// routes/index.js handles the `/` route
export default {
  get() {
    // proper JavaScript objects are served as JSON
    return [
      {name: "Donald"},
      {name: "Ryan"},
    ];
  },
};

```

### Streams

```js
import {File} from "runtime-compat/filesystem";

// routes/index.js handles the `/` route
export default {
  get() {
    // ReadableStream or Blob objects are streamed to the client
    return new File("users.json");
  },
};

```

### Response

```js
import {Response} from "runtime-compat/http";

// routes/index.js handles the `/` route
export default {
  get() {
    // use a Response object for custom response status
    return new Response("created!", {status: 201});
  },
};

```

### HTML

```js
import {html} from "primate";

// routes/index.js handles the `/` route
export default {
  get() {
    // to serve HTML, import and use the html handler
    return html("<p>Hello, world!</p>");
  },
};

```

## Routing

Primate uses filesystem-based routes. Every path a client accesses is mapped to 
a route under `routes`.

* `index.js` handles the root route (`/`)
* `post.js` handles the `/post` route
* `post/{postId}.js` handles a parameterized route where `{postId}` can
  be mapped to anything, such as `/post/1`

### Basic

```js
import {redirect} from "primate";

// routes/site/login.js handles the `/site/login` route
export default {
  get() {
    // strings are served as plain text
    return "Hello, world!";
  },
  // other HTTP verbs are also available
  post() {
    return redirect("/");
  },
};

```

### The request object

```js
// routes/site/login.js handles the `/site/login` route
export default {
  get(request) {
    // will serve `["site", "login"]` as JSON
    return request.path;
  },
};

```

### Accessing the request body

For requests containing a body, Primate will attempt to parse the body according
to the content type sent along the request. Currently supported are
`application/x-www-form-urlencoded` (typically for form submission) and
`application/json`.

```js
// routes/site/login.js handles the `/site/login` route
export default {
  get(request) {
    return `username submitted: ${request.body.username}`;
  },
};

```

### Parameterized routes

```js
// routes/user/{userId}.js handles all routes of the sort `/user/{userId}`
// where {userId} can be anything
export default {
  get(request) {
    return `user id: ${request.named.userId}`;
  },
};

```

### Explicit handlers

Often we can figure out the content type to respond with based on the return
type from the handler. For other cases, we need to use an explicit handler.

```js
import {redirect} from "primate";

// routes/source.js handles the `/source` route
export default {
  get() {
    return redirect("/target");
  },
};

```

## Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

## License

MIT
