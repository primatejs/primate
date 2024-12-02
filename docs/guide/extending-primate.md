# Extending Primate

!!!
This section is about extending Primate yourself. If you're interested in using
any of the official Primate modules, refer to
[Official modules](/modules/official).
!!!

Primate's minimal and extensible goals go hand in hand. It has a limited set of
built-in features that are deemed useful for every web application. For
specific use cases, it offers a set of hooks that allow extensions, referred to
as modules, to augment its core functionality.

Modules can be used separately or in conjunction and can depend on other
modules. All modules are loaded in Primate's configuration file by initializing
them into the `modules` array.

## Writing modules

A Primate module is a an object with different properties representing hook
subscriptions. The subscriber functions are called whenever the hook executes.
A common pattern when writing modules is to design them as a function that
accepts configuration options and returns a subscription object. Here is an
excerpt from the Primate session module, adding cookie-based sessions.

```js caption=Session module
// module configuration options, `name` is the session cookie name
export default ({ name = "session_id" } = {}) => {
  return {
    // module name, must be unique
    name: "@primate/session",
    // `handle` hook subscriber, executed before `Primate` handles the request
    async handle(request, next) {
      // extract session cookie value
      const { name: id } = request.cookies;
      // generate new session or return existing (implementation omitted)
      const session = generateOrReturnSession(id);

      // execute the next `handle` module in line and record response
      const response = await next({ ...request, session });

      // if new session, set the `Set-Cookie` header to inform client
      if (session.id !== id) {
        const cookie = createCookie(name, session.id, options);
        response.headers.set("Set-Cookie", cookie);
      }
      return response;
    },
  };
};
```

The session module latches onto to the `handle` hook, extracting the value of a
cookie named (unless otherwise specified) `session_id` from the request. It then
either generates a new session or uses an existing one and calls the `next`
function with that session. The `next` function could be another module using
the `handle` hook or, at the end of the line, the route function itself, which
will have the session available as a property of its request object.

```js caption=routes/session.js
export default {
  get(request) {
    return request.session.id;
  },
};
```

A client requesting `GET /session` would see a plain text response with its
session id.

After the `next` function returns with a response, the session module adds a
`Set-Cookie` header to the response in case of a newly created session,
instructing the client to save the cookie so that it sends it with the next
request.

!!!
Modules may subscribe to any or all hooks, including none. All modules must
advertise a `name` property, and Primate will refuse to start if it encounters
the same name for a module more than once.
!!!

## Using modules

To use a Primate module, add it into the `modules` array of your app
configuration.

```js caption=primate.config.js
import session from "@primate/session";

export default {
  modules: [
    // initialize the session module with default configuration
    session(),
  ],
};
```

If the module accepts configuration options, you can pass them when
initializing the module.

```js caption=primate.config.js
import session from "@primate/session";

export default {
  modules: [
    // initialize the session module with `"id"` as session cookie name
    session({ name: "id" }),
  ],
};
```

This configuration will use `id` instead of `session_id` as the name of the
session cookie.

The order of loaded modules in the `modules` array determines the order in
which the hooks will call them.

## Ad-hoc modules

All modules are just subscription objects. You can therefore easily create and
pass modules directly in your configuration file.

```js caption=primate.config.js
export default {
  modules: [{
    name: "ad-hoc module",
    load(app) {
      console.log(`running on port ${app.config.http.port}`);
    },
  }],
};
```

When you issue `npx primate`, you should see `running on port 6161` (unless
you've changed the port in your configuration).
