# Hooks

Hooks are executed throughout various stages in the lifecycle of a Primate app.
Some will execute only once on startup, others on given events. Hook
subscribers accept different types of parameters, depending on the hook.

## load

**Executed** once

**Precondition** configuration has been loaded and merged with defaults

The first hook to be called, directly after app start-up and loading the
configuration file. This hook is for modules to load other modules.

```js caption=primate.config.js
export default {
  modules: [{
    name: "load-hook-example-module",
    // return a list of modules
    load() {
      return [
        {
          name: "dependent-name"
        },
      ];
    },
  }],
};
```

!!!
Dependent modules loaded using `app.load` **are not** currently triggered
by `load` hook themselves. Also, unlike most other hooks, the `load` hook does
not accept a final `next` parameter.
!!!

## init

**Executed** once

**Precondition** all modules have been loaded

The hook allows modules to initialize state before any other hooks are called.

```js caption=primate.config.js
const module = () => {
  let app;

  return {
    name: "init-hook-example-module",
    init(app$) {
      // storage reference to app
      app = app$;
    },
  };
};

export default {
  modules: [
    module(),
  ],
};
```

!!!
Unlike most other hooks, the `init` hook does not accept a final `next`
parameter.
!!!

## build

**Executed** once, at buildtime

**Precondition** none

This hook allows modules to execute buildtime logic.

## serve

**Executed** once, at runtime

**Precondition** none

This hook allows modules to execute runtime logic.

```js caption=primate.config.js
const mustache_handler = (name, props, options) => {
  // load the component file using its name and render it into HTML with props
};

export default {
  modules: [{
    name: "register-hook-example-module",
    // accepts the app object augmented with a `register` function
    build(app, next) {
      app.register("mustache", mustache_handler);
      return next(app);
    },
  }],
};
```

By that definition, any `mustache` file in `components` will be handled by the
specified `mustache_handler` handler function.

```js caption=routes/clock.js
import view from "primate/handler/view";

export default {
  get(request) {
    const time = request.query.get("time");

    return view("clock.mustache", { time });
  },
};
```

Assuming a clock component which takes a time value and shows a clock has been
defined in `components/clock.mustache`, a client requesting
`GET /clock?time=11:45am` will have the `view` handler show a mustache
component rendered into HTML.

## handle

**Executed** for every request

**Precondition** all start-up hooks have been executed, and Primate has left
the start-up phase and is serving content

This hook allows modules to handle requests themselves, before Primate tries
to handle them on its own. It has the highest priority, being resolved before
any static or in-memory assets are served and before route functions are
matched. It is particularly useful if you want to treat certain routes in
a special way, but otherwise let Primate do the routing for you.

It is particularly useful for modules which modify the request object in a way
that exposes further functionality for all subsequent handlers, such as the
[session module](/modules/session).

If you need to manipulate the request object for *just for* the route function,
use the `route` hook instead.

```js caption=primate.config.js
const augment = request => {
  return { ...request, /*
    augment request with additional properties such as client ip, by reading
    them from the original request at `request.original`
  */ };
};

export default {
  modules: [{
    name: "handle-hook-example-module",
    // accepts the request object without the `path` property
    handle(request, next) {
      return next(augment(request));
    },
  }],
};
```

## route

**Executed** for every request

**Precondition** the request hasn't been completely handled by the `handle`
phase and a route has been matched

This hook allows modules to transform requests after they have been matched
by a route function but before it executes.

It is particularly useful for modifying the request object in a way that
exposes further functionality specifically for the route function such as the
[store module](/modules/store).

If you need to manipulate the request object for *all* requests (including
assets), use the `handle` hook instead.

```js caption=primate.config.js
const delegate = request => {
  // pass the request to admin app
};

export default {
  modules: [{
    name: "route-hook-example-module",
    // accepts the request object without the `path` property
    route(request, next) {
      if (request.url.pathname.startsWith("/admin")) {
        // delegate request to admin app
        return delegate(request);
      }
      // otherwise let other subscribers or Primate handle the request
      return next(request);
    },
  }],
};
```

## When should I call \`next\`?

Calling `next` in a hook means calling the next module in line which has
subscribed to the hook, and in the case of the `handle` and `route` hooks,
eventually passing over control back to Primate. Most of the time, it makes
sense to call `next` because you want other modules to do their job. However,
especially in the case of `handle` and `route`, you sometimes deliberately
don't want to call `next` because you're handling or routing the request
completely on your own. In some circumstances, a hybrid solution makes the most
sense: some requests you're handling on your own, and for some you want the
normal Primate logic to run its due course.

[frontend frameworks]: /modules/frontend
