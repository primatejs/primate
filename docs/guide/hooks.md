# Hooks

Hooks are executed throughout various stages in the lifecycle of a Primate app.
Some will execute only once on startup, others on given events. Hook
subscribers accept different types of parameters, depending on the hook.

## Lifecycle

```sh caption=Primate app lifecycle
┌─ # read configuration and merge with defaults
├─ `load`
│   └─ # modules initialize / load other modules
├─ # *begin* start-up phase, all hooks in this phase are called once
├─ `register`
│   └─ # modules register component file extensions for the `view` handler
├─ `compile`
│   └─ # modules compile server-side files into JavaScript
├─ `publish`
│   └─ # modules publish client-side code and entry points to memory
├─ # evaluate entry points, load JavaScript/CSS files in `static` to memory
├─ # create `public` and copy files from `static` to `public`
├─ `bundle` # if `npx primate serve` is run, otherwise skipped
│   └─ # modules transform in-memory client-side code
├─ `serve`
│   └─ # modules modify the underlying server to access low-level operations
├─ # *end* start-up phase
├─ # *begin* client request phase, hooks here are called per request
├─ `handle` # on client request
│   └─ # modules handle client request themselves or yield to `next`
├─ # if yielded through, match request against static assets in `public`
├─ # if unmatched, match request against in-memory assets
| # if yielded through, match route
├─ `route` # if previously unmatched
│   └─ # modules handle routing request themselves or yield to `next`
| # if yielded through, execute route function
└─ # *end* client request phase due to program shutdown
```

## load

**Executed** once

**Precondition** configuration has been loaded and merged with defaults

The first hook to be called, directly after app start-up and loading the
configuration file. This hook is for modules to initialize state or load other
modules.

```js caption=primate.config.js
export default {
  modules: [{
    name: "load-hook-example-module",
    /* receives the app object, augmented with a `load` function */
    load(app) {
      app.load({
        name: "dependent-module",
      });
    },
  }],
};
```

!!!
Dependent modules loaded using `app.load` **are not** currently triggered
by `load` hook themselves. Also, unlike all other hooks, the `load` hook does
not accept a final `next` parameter.
!!!

## register

**Executed** once

**Precondition** none

This hook allows modules to register a component file extension to be handled
by `view`.

```js caption=primate.config.js
/**
/* @param {string} name the component name, for example `clock.mustache` 
/* @param {object} props any props passed to the component
/* @param {options} options any additional options passed to the component
 */
const mustacheHandler = (name, props, options) => {
  /* load the component file and render it into HTML using props */
};

export default {
  modules: [{
    name: "register-hook-example-module",
    /* receives the app object augmented with a `register` function */
    register(app, next) {
      app.register("mustache", mustacheHandler);
      return next(app);
    },
  }],
};
```

By that definition, any `.mustache` file in `components` will be handled by
the specified `mustacheHandler` handler function.

```js caption=routes/clock.js
import {view} from "primate";

export default {
  get(request) {
    const {time} = request.query;
    return view("clock.mustache", {time});
  },
};
```

Assuming a clock component which takes a time value and shows a clock has been
defined in `components/clock.mustache`, a client requesting
`GET /clock?time=11:45am` will have the `view` handler show a mustache
component rendered into HTML.

## compile

***Executed** once

**Precondition** none

This hook allows modules to compile server-side components into JavaScript. Is
it particularly useful for [frontend frameworks][frontend-frameworks] which use
their own domain-specific languages (React's `.jsx`, Vue's `.vue` (SFC),
Svelte's `.svelte` etc.) to be served through server-side rendering.

This hook receives the app as its first and the next subscriber as its second
parameter.

## publish

***Executed** once

**Precondition** none

This hook allows modules to publish client-side code and entry points to
memory. Primate loads and serves JavaScript/CSS files in the `static`
directory directly from memory, and this hook is particularly useful for
[frontend frameworks][frontend-frameworks], which might need to register their
own core scripts.

Publishing entry points allow bundler modules to effectively consolidate code
during the `bundle` hook.

This hook receives the app as its first and the next subscriber as its second
parameter.

## bundle

!!!
This hook only executes if Primate has been explicitly run with
`npx primate serve`. Running `npx primate` skips this hook. This allows you to
turn bundling on and off as necessary.
!!!

**Executed** once

**Precondition** all entry points have been evaluated, JavaScript/CSS files in
`static` directory have been loaded to memory, and the `public` directory has
been created with non Javascript/CSS files copied into it from `static`

This hook allows modules to transform client-side code and entry points which
have been loaded into memory previously, either during the `publish` hook or by
Primate loading them from the `static` directory, into consolidated code. It is
particularly useful for bundler modules such as [esbuild](/modules/esbuild).

This hook receives the app as its first and the next subscriber as its second
parameter.

## serve

**Executed** once

**Precondition** The HTTP server has been created.

This hook allows modules to access the low-level HTTP server implementation in
order to deal with additions to HTTP such as the WebSocket protocol. Such
modules can add support for additional verbs aside from the official HTTP
verbs. For example, the [WebSocket](/modules/ws) module adds support for
a `ws` verb.

This hook receives the app, augmented with a `server` property, as its first
and the next subscriber as its second parameter.

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
  return {...request, /*
    augment request with additional properties such as client ip, by reading
    them from the original request at `request.original`
  */};
};

export default {
  modules: [{
    name: "handle-hook-example-module",
    /* receives the request object without the `path` property */
    handle(request, next) {
      return next(augment(request));
    },
  }],
};
```

## route

**Executed** for every request

**Precondition** the request hasn't been completely handled by the `handle`
phase and a route has been match

This hook allows modules to transform requests after they have been matched
by a route function but before it executes.

It is particularly useful for modifying the request object in a way that
exposes further functionality specifically for the route function such as the
[store module](/modules/store).

If you need to manipulate the request object for *all* requests (including
assets), use the `handle` hook instead.

```js caption=primate.config.js
const delegate = request => {
  /* pass the request to admin app */
};

export default {
  modules: [{
    name: "route-hook-example-module",
    /* receives the request object without the `path` property */
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

[frontend-frameworks]: /modules/frameworks
